import { sessionTerms } from "@/lib/session-terms";
import { db } from "@/lib/db";
import { expireStaleHolds } from "@/lib/waitlist";

export type RegistrationUpdateResult =
  | { ok: true; gameId: string }
  | { ok: false; error: string; gameId?: string };

/** Serialize offline payments with checkout, cancellation, and hold expiry. */
export async function markOfflinePayment(
  registrationId: string,
  organizerId: string
): Promise<RegistrationUpdateResult> {
  // Only the immutable game ID is read before the lock. Never act on a stale
  // registration status or price after waiting for another mutation to finish.
  const target = await db.registration.findUnique({
    where: { id: registrationId },
    select: { gameId: true },
  });
  if (!target) return { ok: false, error: "Registration not found." };
  const { gameId } = target;

  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    const reg = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { game: true },
    });
    if (!reg) return { ok: false, error: "Registration not found." };
    const membership = await tx.membership.findUnique({
      where: { userId_orgId: { userId: organizerId, orgId: reg.game.orgId } },
    });
    if (membership?.role !== "ORGANIZER") {
      return { ok: false, error: "Not authorized for this club." };
    }

    // An expected rejection must not roll back expired-hold cleanup/promotion.
    await expireStaleHolds(tx, gameId);
    const current = await tx.registration.findUnique({ where: { id: registrationId } });
    if (current?.status === "CONFIRMED" && current.payStatus === "PAID") {
      return { ok: true, gameId }; // Retrying never records a second payment.
    }
    if (!current || !["PROVISIONAL", "OFFERED"].includes(current.status) || current.payStatus !== "UNPAID") {
      return { ok: false, gameId, error: "Only players holding an unpaid spot can be marked paid." };
    }
    const terms = await sessionTerms(tx, current.userId, reg.game);
    if (terms.error) return { ok: false, gameId, error: terms.error };
    const priceCents = current.priceCents ?? terms.priceCents;
    const taken = await tx.registration.count({
      where: { gameId, status: { in: ["CONFIRMED", "PROVISIONAL", "OFFERED"] } },
    });
    if (taken > reg.game.capacity) {
      return { ok: false, gameId, error: "This game is over capacity. Resolve the roster before marking payment." };
    }

    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CONFIRMED", payStatus: "PAID", priceCents, offerExpiresAt: null, waitlistPos: null },
    });
    await tx.payment.create({
      data: {
        userId: current.userId,
        gameId,
        amountCents: priceCents,
        method: "In person (marked by organizer)",
        status: "SUCCEEDED",
      },
    });
    return { ok: true, gameId };
  });
}

/** Accept a free/pay-later offer, committing expiry even when acceptance fails. */
export async function acceptSpotOffer(gameId: string, userId: string): Promise<RegistrationUpdateResult> {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    const game = await tx.game.findUnique({ where: { id: gameId } });
    if (!game) return { ok: false, error: "Game not found." };
    const terms = await sessionTerms(tx, userId, game);
    if (terms.error) return { ok: false, gameId, error: terms.error };
    const reg = await tx.registration.findUnique({ where: { userId_gameId: { userId, gameId } } });
    const expired = reg?.status === "OFFERED" && reg.offerExpiresAt && reg.offerExpiresAt <= new Date();
    await expireStaleHolds(tx, gameId);
    if (expired) return { ok: false, gameId, error: "This offer expired." };
    if (game.startsAt <= new Date()) {
      return { ok: false, gameId, error: "Registration is closed for this game." };
    }
    if (game.model === "PAY" && terms.priceCents > 0) return { ok: false, gameId, error: "Checkout is required for this spot." };
    if (!reg || reg.status !== "OFFERED") return { ok: false, gameId, error: "No active offer." };

    await tx.registration.update({
      where: { id: reg.id },
      data: {
        priceCents: terms.priceCents,
        status: terms.priceCents === 0 ? "CONFIRMED" : "PROVISIONAL",
        payStatus: terms.priceCents === 0 ? "FREE" : "UNPAID",
        waitlistPos: null,
        offerExpiresAt: null,
      },
    });
    return { ok: true, gameId };
  });
}
