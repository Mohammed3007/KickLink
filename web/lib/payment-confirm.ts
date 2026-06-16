import { db } from "@/lib/db";

/**
 * Mark a registration paid + confirmed and record the payment.
 * Idempotent on stripeSessionId so webhook retries are safe.
 * Used by both the Stripe webhook and the dev test-payment path.
 */
export async function confirmPaidRegistration(opts: {
  userId: string;
  gameId: string;
  amountCents: number;
  method: string;
  stripeId?: string;
  stripeSessionId?: string;
}) {
  const { userId, gameId, amountCents, method, stripeId, stripeSessionId } = opts;

  if (stripeSessionId) {
    const already = await db.payment.findFirst({ where: { stripeSessionId } });
    if (already) return; // webhook already processed this session
  }

  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { title: true },
  });

  await db.$transaction(async (tx) => {
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
    await tx.payment.create({
      data: {
        userId,
        gameId,
        amountCents,
        method,
        status: "SUCCEEDED",
        stripeId,
        stripeSessionId,
      },
    });
    await tx.notification.create({
      data: {
        userId,
        kind: "RECEIPT",
        title: `Receipt - ${game?.title ?? "Game"}`,
        body: `$${(amountCents / 100).toFixed(2)} paid - ${method}`,
        href: `/games/${gameId}/join?success=1`,
      },
    });
  });
}
