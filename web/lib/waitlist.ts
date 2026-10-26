import { db } from "@/lib/db";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

/** How long a waitlisted player has to accept an offered spot. */
export const OFFER_WINDOW_MINUTES = 15;

/**
 * How long a spot is held while the player is in Stripe Checkout. Checkout
 * sessions expire after CHECKOUT_SESSION_MINUTES, so the hold outlives them
 * and a player can never pay for a spot that was already released.
 */
export const CHECKOUT_SESSION_MINUTES = 31;
export const CHECKOUT_HOLD_MINUTES = CHECKOUT_SESSION_MINUTES + 5;

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * Offer freed spots to the next people on the waitlist (status → OFFERED
 * with a time-limited window) and notify them. Fills every open spot.
 * Call inside a transaction holding the game lock, after the freeing change.
 */
export async function promoteWaitlist(tx: Tx, gameId: string) {
  const game = await tx.game.findUnique({
    where: { id: gameId },
    select: { capacity: true, title: true, model: true, startsAt: true },
  });
  if (!game || game.startsAt <= new Date()) return;

  const taken = await tx.registration.count({
    where: { gameId, status: { in: [...OCCUPYING] } },
  });
  const open = game.capacity - taken;
  if (open <= 0) return; // still full, nothing to offer

  const next = await tx.registration.findMany({
    where: { gameId, status: "WAITLISTED" },
    orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }],
    take: open,
  });

  for (const entry of next) {
    await tx.registration.update({
      where: { id: entry.id },
      data: {
        status: "OFFERED",
        payStatus: game.model === "FREE" ? "FREE" : "UNPAID",
        waitlistPos: null,
        offerExpiresAt: new Date(Date.now() + OFFER_WINDOW_MINUTES * 60_000),
      },
    });
    await tx.notification.create({
      data: {
        userId: entry.userId,
        kind: "OFFER",
        title: `A spot opened up — ${game.title}`,
        body: "You're next in line. Accept within the window to claim it.",
        href: `/games/${gameId}`,
      },
    });
  }
  // Everyone still waiting moves up the line.
  if (next.length > 0) await compactWaitlist(tx, gameId);
}

/** Renumber waitlist positions 1..n after someone leaves it. */
export async function compactWaitlist(tx: Tx, gameId: string) {
  const waitlist = await tx.registration.findMany({
    where: { gameId, status: "WAITLISTED" },
    orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  for (const [index, entry] of waitlist.entries()) {
    await tx.registration.update({
      where: { id: entry.id },
      data: { waitlistPos: index + 1 },
    });
  }
}

/**
 * Release spots whose offer window or checkout hold has lapsed, then offer
 * them on. Call inside a transaction holding the game lock.
 * Pay-later reservations have no expiry and are never released here.
 */
export async function expireStaleHolds(tx: Tx, gameId: string) {
  const now = new Date();
  const stale = await tx.registration.findMany({
    where: {
      gameId,
      offerExpiresAt: { lte: now },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { id: true, userId: true, status: true },
  });
  if (stale.length === 0) return 0;

  await tx.registration.updateMany({
    where: { id: { in: stale.map((r) => r.id) } },
    data: { status: "CANCELLED", waitlistPos: null, offerExpiresAt: null },
  });

  const game = await tx.game.findUnique({ where: { id: gameId }, select: { title: true } });
  await tx.notification.createMany({
    data: stale.map((r) => ({
      userId: r.userId,
      kind: "WAITLIST" as const,
      title: `Spot released — ${game?.title ?? "Game"}`,
      body:
        r.status === "OFFERED"
          ? "Your offer window closed, so the spot went to the next player."
          : "Checkout wasn't completed in time, so your held spot was released.",
      href: `/games/${gameId}`,
    })),
  });

  await promoteWaitlist(tx, gameId);
  return stale.length;
}

/** Sweep one game's lapsed holds in its own locked transaction. */
export async function sweepGameHolds(gameId: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    return expireStaleHolds(tx, gameId);
  });
}

/** True if a game has lapsed holds waiting to be released. */
export async function hasStaleHolds(gameId: string) {
  const stale = await db.registration.findFirst({
    where: {
      gameId,
      offerExpiresAt: { lte: new Date() },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { id: true },
  });
  return Boolean(stale);
}

/** Release lapsed holds across all games (scheduled job). */
export async function sweepAllHolds() {
  const games = await db.registration.findMany({
    where: {
      offerExpiresAt: { lte: new Date() },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { gameId: true },
    distinct: ["gameId"],
  });
  let released = 0;
  for (const { gameId } of games) released += await sweepGameHolds(gameId);
  return { games: games.length, released };
}
