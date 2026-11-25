import type Stripe from "stripe";
import { db } from "@/lib/db";

export function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

/** Retrieve current provider state; delayed/replayed events never extend access without a paid invoice. */
export async function syncClubSubscription(stripe: Stripe, subscriptionId: string, eventCreated = 0) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
  const recordId = subscription.metadata.clubSubscriptionId;
  if (!recordId) return;
  const invoice = typeof subscription.latest_invoice === "object" ? subscription.latest_invoice : null;
  const item = subscription.items.data[0];
  const line = invoice?.lines.data.find((entry) => entry.parent?.subscription_item_details?.subscription_item === item?.id);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "ClubSubscription" WHERE "id" = ${recordId} FOR UPDATE`;
    const local = await tx.clubSubscription.findUnique({
      where: { id: recordId }, include: { membership: { include: { org: true } } },
    });
    if (!local || subscription.metadata.checkoutAttemptId !== local.checkoutAttemptId) return;
    if (local.stripeSubscriptionId && local.stripeSubscriptionId !== subscription.id) return;
    if (stripeId(subscription.transfer_data?.destination) !== local.membership.org.stripeAccountId) {
      throw new Error("Membership payout account does not match the club.");
    }
    if (local.stripeCustomerId && local.stripeCustomerId !== stripeId(subscription.customer)) {
      throw new Error("Membership customer mismatch.");
    }
    let paidThrough = local.paidThrough;
    // No trials/coupons are offered. A zero/unpaid invoice cannot activate a paid membership.
    if (invoice?.status === "paid" && invoice.currency === "cad" && invoice.amount_paid >= local.amountCents && line) {
      const periodEnd = new Date(line.period.end * 1000);
      if (!paidThrough || periodEnd > paidThrough) paidThrough = periodEnd;
      await tx.membershipInvoice.upsert({
        where: { stripeInvoiceId: invoice.id }, update: {},
        create: { stripeInvoiceId: invoice.id, subscriptionId: local.id, amountCents: invoice.amount_paid, currency: invoice.currency, periodEnd },
      });
    }
    const latest = !eventCreated || eventCreated >= local.lastEventCreated;
    await tx.clubSubscription.update({
      where: { id: local.id },
      data: {
        paidThrough, stripeSubscriptionId: subscription.id, stripeCustomerId: stripeId(subscription.customer),
        ...(latest ? { status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end } : {}),
        lastEventCreated: Math.max(eventCreated, local.lastEventCreated),
      },
    });
  });
}
