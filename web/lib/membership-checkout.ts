import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { appUrl, platformFeeBps } from "@/lib/stripe";
import { hasPaidMembership } from "@/lib/membership-policy";

/** Persist a billing attempt before contacting Stripe, so retries recover the same checkout. */
export async function beginMembershipCheckout(stripe: Stripe, user: { id: string; email: string }, orgId: string, plan: "MONTHLY" | "YEARLY") {
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  if (!org.membershipEnabled || !org.chargesEnabled || !org.stripeAccountId) {
    return { error: "This club is not accepting membership payments yet." };
  }
  const membership = await db.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId } }, update: {}, create: { userId: user.id, orgId, clubAccess: false },
  });
  const prepared = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Membership" WHERE "id" = ${membership.id} FOR UPDATE`;
    const current = await tx.clubSubscription.findUnique({ where: { membershipId: membership.id } });
    if (hasPaidMembership(current)) return { error: "You already have an active membership." };
    if (current?.stripeSubscriptionId) {
      const live = await stripe.subscriptions.retrieve(current.stripeSubscriptionId);
      if (!["canceled", "incomplete_expired"].includes(live.status)) {
        return { error: "An existing subscription needs attention. Use Manage billing to update your payment method." };
      }
    }
    if (current?.checkoutExpiresAt && current.checkoutExpiresAt > new Date()) {
      if (current.checkoutSessionId) {
        const pending = await stripe.checkout.sessions.retrieve(current.checkoutSessionId);
        if (pending.status === "open" && pending.url) return { url: pending.url };
        if (pending.status === "complete") return { error: "Your payment is being confirmed. Check membership status below." };
      } else if (current.checkoutAttemptId) {
        return { record: current }; // Recover a failed/ambiguous provider call using the same key.
      }
    }
    const attempt = randomUUID();
    const amountCents = plan === "MONTHLY" ? org.monthlyMembershipCents : org.yearlyMembershipCents;
    const data = { plan, amountCents, checkoutAttemptId: attempt, checkoutSessionId: null, checkoutExpiresAt: new Date(Date.now() + 24 * 3600_000), stripeSubscriptionId: null, status: "incomplete", cancelAtPeriodEnd: false, lastEventCreated: 0 };
    return { record: await tx.clubSubscription.upsert({
      where: { membershipId: membership.id }, create: { membershipId: membership.id, ...data }, update: data,
    }) };
  }, { timeout: 30_000 });
  if (!("record" in prepared) || !prepared.record) return prepared;
  const record = prepared.record;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", payment_method_types: ["card"],
    customer: record.stripeCustomerId ?? undefined,
    customer_email: record.stripeCustomerId ? undefined : user.email,
    client_reference_id: membership.id,
    line_items: [{ quantity: 1, price_data: {
      currency: "cad", unit_amount: record.amountCents,
      recurring: { interval: record.plan === "MONTHLY" ? "month" : "year" },
      product_data: { name: `${org.name} ${record.plan === "MONTHLY" ? "monthly" : "yearly"} membership` },
    } }],
    subscription_data: {
      metadata: { clubSubscriptionId: record.id, checkoutAttemptId: record.checkoutAttemptId! },
      transfer_data: { destination: org.stripeAccountId },
      ...(platformFeeBps() ? { application_fee_percent: platformFeeBps() / 100 } : {}),
    },
    metadata: { purpose: "club_membership", clubSubscriptionId: record.id },
    success_url: `${appUrl()}/clubs/${org.handle}/membership?checkout=success`,
    cancel_url: `${appUrl()}/clubs/${org.handle}/membership`,
  }, { idempotencyKey: `membership_${record.id}_${record.checkoutAttemptId}` });
  await db.clubSubscription.updateMany({
    where: { id: record.id, checkoutAttemptId: record.checkoutAttemptId },
    data: { checkoutSessionId: session.id, checkoutExpiresAt: new Date(session.expires_at * 1000) },
  });
  return { url: session.url ?? undefined };
}
