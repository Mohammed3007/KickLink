import type { Payment } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export { DEFAULT_REFUND_POLICY, isRefundable, REFUND_CUTOFF_HOURS } from "@/lib/refund-policy";

/** Card payments carry a Stripe PaymentIntent id; test payments use `dev_`. */
export function paymentKind(payment: Pick<Payment, "stripeId">) {
  if (payment.stripeId?.startsWith("pi_")) return "stripe" as const;
  if (payment.stripeId?.startsWith("dev_")) return "dev" as const;
  return "offline" as const;
}

/**
 * Refund one payment and mark it REFUNDED. Card payments are refunded through
 * Stripe, pulling the transfer back from the club and returning the platform
 * fee. The idempotency key makes retries safe if the DB update fails after
 * Stripe has already refunded. Offline (in-person) payments can't be refunded
 * here and are left for the organizer to settle; returns false for those.
 */
export async function refundPayment(payment: Payment): Promise<boolean> {
  if (payment.status !== "SUCCEEDED") return false;
  const kind = paymentKind(payment);
  if (kind === "offline") return false;

  if (kind === "stripe") {
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe is not configured; cannot refund card payment.");
    await stripe.refunds.create(
      {
        payment_intent: payment.stripeId!,
        reverse_transfer: true,
        refund_application_fee: true,
      },
      { idempotencyKey: `refund_${payment.id}` }
    );
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED", refundDue: false },
  });
  return true;
}

/** Retry refunds owed for payments that arrived after their spot was gone. */
export async function processDueRefunds() {
  const due = await db.payment.findMany({
    where: { refundDue: true, status: "SUCCEEDED" },
    take: 50,
  });
  let refunded = 0;
  for (const payment of due) {
    try {
      if (await refundPayment(payment)) refunded += 1;
    } catch (error) {
      console.error("Refund retry failed", payment.id, error);
    }
  }
  return { due: due.length, refunded };
}

/** Refund every successful payment a player made for a game. */
export async function refundGamePayments(userId: string, gameId: string) {
  const payments = await db.payment.findMany({
    where: { userId, gameId, status: "SUCCEEDED" },
  });
  let refunded = false;
  for (const payment of payments) {
    if (await refundPayment(payment)) refunded = true;
  }
  return refunded;
}
