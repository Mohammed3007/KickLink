import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import type { ClubSubscription, Organization } from "@/lib/generated/prisma/client";
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
      if (current.checkoutSessionId || (current.checkoutAttemptId && current.plan !== plan)) {
        // Recover an ambiguous creation with its original idempotency key before
        // switching plans, so no abandoned checkout can still accept payment.
        const pending = current.checkoutSessionId
          ? await stripe.checkout.sessions.retrieve(current.checkoutSessionId)
          : await createMembershipSession(stripe, user, org, current);
        if (pending.status === "complete") return { error: "Your payment is being confirmed. Check membership status below." };
        if (pending.status === "open") {
          if (current.plan === plan) return pending.url ? { url: pending.url } : { error: "Your checkout is not available yet. Please try again." };
          // If payment wins this race Stripe refuses expiry; leave the old
          // attempt intact and never create a second subscription.
          await stripe.checkout.sessions.expire(pending.id);
        } else if (pending.status !== "expired") {
          return { error: "Your checkout is being updated. Please try again." };
        }
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
  const session = await createMembershipSession(stripe, user, org, record);
  await db.clubSubscription.updateMany({
    where: { id: record.id, checkoutAttemptId: record.checkoutAttemptId },
    data: { checkoutSessionId: session.id, checkoutExpiresAt: new Date(session.expires_at * 1000) },
  });
  return { url: session.url ?? undefined };
}

function createMembershipSession(stripe: Stripe, user: { email: string }, org: Organization, record: ClubSubscription) {
  if (!org.stripeAccountId) throw new Error("Membership payout account is not configured.");
  return stripe.checkout.sessions.create({
    mode: "subscription", payment_method_types: ["card"],
    customer: record.stripeCustomerId ?? undefined,
    customer_email: record.stripeCustomerId ? undefined : user.email,
    client_reference_id: record.membershipId,
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
}
