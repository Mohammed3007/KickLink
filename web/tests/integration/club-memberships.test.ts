import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";

if (!process.env.TEST_DATABASE_URL) throw new Error("Set TEST_DATABASE_URL to a disposable migrated database.");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
let db: typeof import("../../lib/db").db;
let terms: typeof import("../../lib/session-terms").sessionTerms;
let waitlist: typeof import("../../lib/waitlist");
let updates: typeof import("../../lib/registration-updates");
let enroll: typeof import("../../lib/league-enrollment").enrollMemberInLeague;
let checkout: typeof import("../../lib/membership-checkout").beginMembershipCheckout;
let sync: typeof import("../../lib/club-billing").syncClubSubscription;
let confirm: typeof import("../../lib/payment-confirm").confirmPaidRegistration;
let orgId: string;
let ownerId: string;
const userIds: string[] = [];
const orgIds: string[] = [];

async function player(paid = false) {
  const user = await db.user.create({ data: { name: "ROS tester", email: `${randomUUID()}@example.test`, emailVerified: new Date() } });
  userIds.push(user.id);
  const member = await db.membership.create({ data: { userId: user.id, orgId } });
  if (paid) await db.clubSubscription.create({ data: { membershipId: member.id, plan: "MONTHLY", status: "active", paidThrough: new Date(Date.now() + 86_400_000) } });
  return { user, member };
}
async function game(access: "OPEN" | "MEMBERS" | "CLUB" = "OPEN", memberPriceCents = 1000) {
  return db.game.create({ data: { orgId, title: "ROS pickup", venue: "Field", startsAt: new Date(Date.now() + 3 * 86_400_000), access, model: "PAY", priceCents: 1500, memberPriceCents, capacity: 1 } });
}
before(async () => {
  ({ db } = await import("../../lib/db"));
  ({ sessionTerms: terms } = await import("../../lib/session-terms"));
  waitlist = await import("../../lib/waitlist");
  updates = await import("../../lib/registration-updates");
  ({ enrollMemberInLeague: enroll } = await import("../../lib/league-enrollment"));
  ({ beginMembershipCheckout: checkout } = await import("../../lib/membership-checkout"));
  ({ syncClubSubscription: sync } = await import("../../lib/club-billing"));
  ({ confirmPaidRegistration: confirm } = await import("../../lib/payment-confirm"));
  const owner = await db.user.create({ data: { name: "Owner", email: `${randomUUID()}@example.test` } });
  ownerId = owner.id; userIds.push(ownerId);
  const org = await db.organization.create({ data: { name: "ROS", handle: randomUUID(), ownerId, membershipEnabled: true, stripeAccountId: "acct_ros", chargesEnabled: true, memberships: { create: { userId: ownerId, role: "ORGANIZER" } } } });
  orgId = org.id; orgIds.push(orgId);
});
after(async () => {
  await db.organization.deleteMany({ where: { id: { in: orgIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

test("paid access is scoped to ROS and expired membership loses benefits", async () => {
  const { user, member } = await player(true);
  const session = await game("MEMBERS");
  assert.equal((await terms(db, user.id, session)).error, null);
  assert.equal((await terms(db, user.id, session)).priceCents, 1000);
  const other = await db.organization.create({ data: { name: "Other club", handle: randomUUID(), ownerId, membershipEnabled: true } });
  orgIds.push(other.id);
  assert.match((await terms(db, user.id, { ...session, orgId: other.id })).error!, /membership/);
  await db.clubSubscription.update({ where: { membershipId: member.id }, data: { paidThrough: new Date(Date.now() - 1000) } });
  assert.match((await terms(db, user.id, session)).error!, /membership/);
  assert.equal((await terms(db, user.id, { ...session, access: "OPEN" })).priceCents, 1500);
});

test("one club membership unlocks multiple league enrollments; unpaid users are rejected", async () => {
  const paid = await player(true); const unpaid = await player();
  const leagues = await Promise.all(["Winter", "Sunday"].map((name) => db.league.create({ data: { orgId, name } })));
  assert.ok((await enroll(unpaid.user.id, leagues[0].id)).error);
  for (const league of leagues) assert.equal((await enroll(paid.user.id, league.id)).ok, true);
  assert.equal((await enroll(paid.user.id, leagues[0].id)).ok, true);
  assert.equal(await db.leagueEnrollment.count({ where: { userId: paid.user.id } }), 2);
  const session = await game("MEMBERS");
  assert.ok((await terms(db, unpaid.user.id, { ...session, leagueId: leagues[0].id })).error);
  assert.equal((await terms(db, paid.user.id, { ...session, leagueId: leagues[0].id })).error, null);
});

test("active members move ahead in waitlists with FIFO within tiers, without displacing offers", async () => {
  const a = await player(); const b = await player(true); const c = await player(true);
  const session = await game();
  for (const [index, userId] of [a.user.id, b.user.id, c.user.id].entries()) {
    await db.registration.create({ data: { userId, gameId: session.id, status: "WAITLISTED", waitlistPos: index + 1, waitlistedAt: new Date(Date.now() + index) } });
  }
  await waitlist.sweepGameHolds(session.id);
  const first = await db.registration.findUniqueOrThrow({ where: { userId_gameId: { userId: b.user.id, gameId: session.id } } });
  assert.equal(first.status, "OFFERED");
  const queue = await db.registration.findMany({ where: { gameId: session.id, status: "WAITLISTED" }, orderBy: { waitlistPos: "asc" } });
  assert.deepEqual(queue.map((r) => r.userId), [c.user.id, a.user.id]);
  await db.clubSubscription.update({ where: { membershipId: c.member.id }, data: { paidThrough: new Date(Date.now() - 1000) } });
  await waitlist.sweepGameHolds(session.id);
  assert.equal((await db.registration.findUniqueOrThrow({ where: { id: first.id } })).status, "OFFERED");
  const reranked = await db.registration.findMany({ where: { gameId: session.id, status: "WAITLISTED" }, orderBy: { waitlistPos: "asc" } });
  // Once membership expires, original arrival order determines the regular tier.
  assert.deepEqual(reranked.map((r) => r.userId), [a.user.id, c.user.id]);
});

test("expired member-only waitlisters are skipped and zero-price members accept without checkout", async () => {
  const expired = await player(true); const paid = await player(true);
  await db.clubSubscription.update({ where: { membershipId: expired.member.id }, data: { paidThrough: new Date(Date.now() - 1000) } });
  const session = await game("MEMBERS", 0);
  for (const [index, userId] of [expired.user.id, paid.user.id].entries()) await db.registration.create({ data: { userId, gameId: session.id, status: "WAITLISTED", waitlistPos: index + 1 } });
  await waitlist.sweepGameHolds(session.id);
  assert.equal((await updates.acceptSpotOffer(session.id, paid.user.id)).ok, true);
  const registration = await db.registration.findUniqueOrThrow({ where: { userId_gameId: { userId: paid.user.id, gameId: session.id } } });
  assert.equal(registration.status, "CONFIRMED"); assert.equal(registration.payStatus, "FREE"); assert.equal(registration.priceCents, 0);
});

test("offline payments preserve a reserved member quote, and webhook underpayment is refunded", async () => {
  const paid = await player(true); const session = await game();
  const registration = await db.registration.create({ data: { userId: paid.user.id, gameId: session.id, status: "PROVISIONAL", priceCents: 1000 } });
  await db.game.update({ where: { id: session.id }, data: { memberPriceCents: 1200 } });
  assert.equal((await updates.markOfflinePayment(registration.id, ownerId)).ok, true);
  assert.equal((await db.payment.findFirstOrThrow({ where: { gameId: session.id } })).amountCents, 1000);
  const regular = await player(); const otherSession = await game();
  const result = await confirm({ userId: regular.user.id, gameId: otherSession.id, amountCents: 1000, method: "Card", stripeSessionId: randomUUID() });
  assert.equal(result.status, "no_spot");
  assert.equal((await db.payment.findFirstOrThrow({ where: { gameId: otherSession.id } })).refundDue, true);
});

test("membership checkout recovers ambiguous provider calls using one stable attempt and the correct rate", async () => {
  for (const plan of ["MONTHLY", "YEARLY"] as const) {
    const { user, member } = await player();
    const keys: string[] = []; const amounts: number[] = []; let first = true;
    const provider = { checkout: { sessions: { create: async (params: Stripe.Checkout.SessionCreateParams, options: Stripe.RequestOptions) => {
      keys.push(options.idempotencyKey!);
      const price = params.line_items![0].price_data!;
      amounts.push(price.unit_amount!);
      assert.equal(price.recurring?.interval, plan === "MONTHLY" ? "month" : "year");
      assert.equal(params.subscription_data?.transfer_data?.destination, "acct_ros");
      if (first) { first = false; throw new Error("Provider reply lost"); }
      return { id: `cs_${randomUUID()}`, url: "https://checkout.stripe.com/test", expires_at: Math.floor(Date.now() / 1000) + 1800 };
    } } } } as unknown as Stripe;
    await assert.rejects(checkout(provider, user, orgId, plan), /reply lost/);
    assert.ok((await checkout(provider, user, orgId, plan)).url);
    assert.equal(keys[0], keys[1]);
    assert.deepEqual(amounts, plan === "MONTHLY" ? [500, 500] : [5000, 5000]);
    assert.equal((await db.clubSubscription.findUniqueOrThrow({ where: { membershipId: member.id } })).paidThrough, null);
  }
});

test("only verified paid invoices grant access; duplicate and old events cannot extend or shrink it", async () => {
  const { member } = await player();
  const local = await db.clubSubscription.create({ data: { membershipId: member.id, plan: "MONTHLY", amountCents: 500, checkoutAttemptId: "attempt" } });
  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 86400;
  const invoice = { id: `in_${randomUUID()}`, status: "open", amount_paid: 0, currency: "cad", lines: { data: [{ period: { end: periodEnd }, parent: { subscription_item_details: { subscription_item: "si_ros" } } }] } };
  const subscription = { id: `sub_${randomUUID()}`, metadata: { clubSubscriptionId: local.id, checkoutAttemptId: "attempt" }, customer: "cus_ros", transfer_data: { destination: "acct_ros" }, status: "active", cancel_at_period_end: false, items: { data: [{ id: "si_ros" }] }, latest_invoice: invoice };
  const provider = { subscriptions: { retrieve: async () => subscription } } as unknown as Stripe;
  await sync(provider, subscription.id, 100);
  assert.equal((await db.clubSubscription.findUniqueOrThrow({ where: { id: local.id } })).paidThrough, null);
  invoice.status = "paid"; invoice.amount_paid = 500;
  await sync(provider, subscription.id, 200); await sync(provider, subscription.id, 200);
  let current = await db.clubSubscription.findUniqueOrThrow({ where: { id: local.id } });
  assert.equal(current.paidThrough!.getTime(), periodEnd * 1000);
  assert.equal(await db.membershipInvoice.count({ where: { subscriptionId: local.id } }), 1);
  invoice.lines.data[0].period.end -= 86400;
  subscription.cancel_at_period_end = true;
  await sync(provider, subscription.id, 150);
  current = await db.clubSubscription.findUniqueOrThrow({ where: { id: local.id } });
  assert.equal(current.paidThrough!.getTime(), periodEnd * 1000); assert.equal(current.cancelAtPeriodEnd, false);
  await sync(provider, subscription.id, 250);
  current = await db.clubSubscription.findUniqueOrThrow({ where: { id: local.id } });
  assert.equal(current.cancelAtPeriodEnd, true);
  assert.equal(current.paidThrough!.getTime(), periodEnd * 1000, "cancelling renewal retains the paid period");
  invoice.status = "open"; invoice.amount_paid = 0; invoice.lines.data[0].period.end += 60 * 86400;
  await sync(provider, subscription.id, 260);
  assert.equal((await db.clubSubscription.findUniqueOrThrow({ where: { id: local.id } })).paidThrough!.getTime(), periodEnd * 1000, "an unpaid renewal never extends access");
  subscription.transfer_data.destination = "acct_other";
  await assert.rejects(sync(provider, subscription.id, 300), /payout account/);
});

test("starting checkout does not grant invite-only club access or expose a private roster", async () => {
  const user = await db.user.create({ data: { name: "Visitor", email: `${randomUUID()}@example.test` } });
  userIds.push(user.id);
  const provider = { checkout: { sessions: { create: async () => ({ id: `cs_${randomUUID()}`, url: "https://checkout.stripe.com/test", expires_at: Math.floor(Date.now() / 1000) + 1800 }) } } } as unknown as Stripe;
  await checkout(provider, user, orgId, "MONTHLY");
  const member = await db.membership.findUniqueOrThrow({ where: { userId_orgId: { userId: user.id, orgId } } });
  assert.equal(member.clubAccess, false);
  const privateGame = await game("CLUB");
  assert.ok((await terms(db, user.id, privateGame)).error);
  const { getGame, getClub } = await import("../../lib/queries");
  assert.equal(await getGame(privateGame.id, user.id), null);
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  await db.announcement.create({ data: { orgId, authorId: ownerId, title: "Private", body: "Private club information" } });
  const preview = await getClub(org.handle, user.id);
  assert.equal(preview!.isMember, false); assert.equal(preview!.announcements.length, 0);
});

test("clubs can disable priority and keep the regular FIFO queue", async () => {
  const regular = await player(); const paid = await player(true);
  const session = await game();
  for (const [index, userId] of [regular.user.id, paid.user.id].entries()) await db.registration.create({
    data: { userId, gameId: session.id, status: "WAITLISTED", waitlistPos: index + 1, waitlistedAt: new Date(Date.now() + index) },
  });
  await db.organization.update({ where: { id: orgId }, data: { memberWaitlistPriority: false } });
  try {
    await waitlist.sweepGameHolds(session.id);
    assert.equal((await db.registration.findUniqueOrThrow({ where: { userId_gameId: { userId: regular.user.id, gameId: session.id } } })).status, "OFFERED");
  } finally { await db.organization.update({ where: { id: orgId }, data: { memberWaitlistPriority: true } }); }
});

test("subscription expiry preserves access to an existing registration without allowing new private bookings", async () => {
  const { user, member } = await player(true);
  await db.membership.update({ where: { id: member.id }, data: { clubAccess: false } });
  const booked = await game("CLUB"); const unbooked = await game("CLUB");
  await db.registration.create({ data: { userId: user.id, gameId: booked.id, status: "CONFIRMED", payStatus: "PAID", priceCents: 1000 } });
  await db.clubSubscription.update({ where: { membershipId: member.id }, data: { paidThrough: new Date(Date.now() - 1000) } });
  const { getGame, listClubGames } = await import("../../lib/queries");
  assert.equal((await getGame(booked.id, user.id))!.myReg!.status, "CONFIRMED");
  assert.equal(await getGame(unbooked.id, user.id), null);
  assert.ok((await terms(db, user.id, unbooked)).error);
  assert.ok((await listClubGames(user.id)).some((entry) => entry.id === booked.id));
});
