import { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type ConfirmResult =
  | { status: "confirmed"; paymentId: string }
  | { status: "no_spot"; paymentId: string }
  | { status: "duplicate"; paymentId?: string };

/**
 * Record a successful payment and confirm the player's spot.
 * Idempotent on stripeSessionId so webhook retries are safe.
 * Used by both the Stripe webhook and the dev test-payment path.
 *
 * If the player no longer holds a spot (they cancelled, were removed, or the
 * hold lapsed) and the game has since filled, the payment is still recorded
 * but the result is "no_spot" so the caller can refund it.
 */
export async function confirmPaidRegistration(opts: {
  userId: string;
  gameId: string;
  amountCents: number;
  method: string;
  stripeId?: string;
  stripeSessionId?: string;
}): Promise<ConfirmResult> {
  const { userId, gameId, amountCents, method, stripeId, stripeSessionId } = opts;

  if (stripeSessionId) {
    const already = await db.payment.findFirst({ where: { stripeSessionId } });
    // Webhook already processed this session.
    if (already) return { status: "duplicate", paymentId: already.id };
  }

  try {
    return await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
      const game = await tx.game.findUnique({
        where: { id: gameId },
        select: { title: true, capacity: true },
      });

      const existing = await tx.registration.findUnique({
        where: { userId_gameId: { userId, gameId } },
      });
      let hasSpot = !!existing && (OCCUPYING as readonly string[]).includes(existing.status);
      if (!hasSpot && game) {
        const taken = await tx.registration.count({
          where: { gameId, status: { in: [...OCCUPYING] } },
        });
        hasSpot = taken < game.capacity;
      }

      const payment = await tx.payment.create({
        data: {
          userId,
          gameId,
          amountCents,
          method,
          status: "SUCCEEDED",
          stripeId,
          stripeSessionId,
          refundDue: !hasSpot,
        },
      });

      const title = game?.title ?? "Game";
      if (!hasSpot) {
        await tx.notification.create({
          data: {
            userId,
            kind: "RECEIPT",
            title: `Refund on the way - ${title}`,
            body: `The game filled before your payment went through, so your $${(amountCents / 100).toFixed(2)} is being refunded.`,
            href: `/games/${gameId}`,
          },
        });
        return { status: "no_spot" as const, paymentId: payment.id };
      }

      await tx.registration.upsert({
        where: { userId_gameId: { userId, gameId } },
        create: { userId, gameId, status: "CONFIRMED", payStatus: "PAID" },
        update: {
          status: "CONFIRMED",
          payStatus: "PAID",
          waitlistPos: null,
          offerExpiresAt: null,
        },
      });
      await tx.notification.create({
        data: {
          userId,
          kind: "RECEIPT",
          title: `Receipt - ${title}`,
          body: `$${(amountCents / 100).toFixed(2)} paid - ${method}`,
          href: `/games/${gameId}/join?success=1`,
        },
      });
      return { status: "confirmed" as const, paymentId: payment.id };
    });
  } catch (error) {
    // A concurrent delivery of the same webhook won the unique index race.
    if (
      stripeSessionId &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "duplicate" };
    }
    throw error;
  }
}
