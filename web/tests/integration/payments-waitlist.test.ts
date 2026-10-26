// Integration tests for capacity, waitlist expiry and payment confirmation
// against a real Postgres. Run with `npm run test:integration`; they need
// TEST_DATABASE_URL pointing at a disposable, migrated database because each
// test creates and deletes its own rows.
import test, { after, before } from "node:test";
import assert from "node:assert/strict";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error("Set TEST_DATABASE_URL to a disposable, migrated Postgres database.");
}
process.env.DATABASE_URL = testUrl;
delete process.env.STRIPE_SECRET_KEY;

// Imported after DATABASE_URL is set so the client connects to the test DB.
let db: typeof import("../../lib/db").db;
let confirmPaidRegistration: typeof import("../../lib/payment-confirm").confirmPaidRegistration;
let waitlist: typeof import("../../lib/waitlist");
let refunds: typeof import("../../lib/refunds");

const runId = `it${Date.now().toString(36)}`;
let orgId = "";
const userIds: string[] = [];

async function makeUser(label: string) {
  const user = await db.user.create({
    data: { email: `${runId}-${label}@example.test`, name: label, emailVerified: new Date() },
  });
  userIds.push(user.id);
  await db.membership.create({ data: { userId: user.id, orgId } });
  return user.id;
}

async function makeGame(capacity: number, model: "PAY" | "FREE" = "PAY") {
  return db.game.create({
    data: {
      orgId,
      title: `Game ${runId}`,
      venue: "Field",
      startsAt: new Date(Date.now() + 3 * 24 * 3_600_000),
      capacity,
      model,
      priceCents: model === "FREE" ? 0 : 1500,
    },
  });
}

before(async () => {
  ({ db } = await import("../../lib/db"));
  ({ confirmPaidRegistration } = await import("../../lib/payment-confirm"));
  waitlist = await import("../../lib/waitlist");
  refunds = await import("../../lib/refunds");

  const owner = await db.user.create({
    data: { email: `${runId}-owner@example.test`, name: "Owner", emailVerified: new Date() },
  });
  userIds.push(owner.id);
  const org = await db.organization.create({
    data: { name: `Org ${runId}`, handle: runId, ownerId: owner.id, inviteCode: `${runId}-CODE` },
  });
  orgId = org.id;
});

after(async () => {
  await db.organization.deleteMany({ where: { id: orgId } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

test("concurrent payments never overfill a game; the late payer is flagged for refund", async () => {
  const game = await makeGame(2);
  const payers = await Promise.all(["a", "b", "c"].map((l) => makeUser(`pay-${l}`)));

  const results = await Promise.all(
    payers.map((userId, i) =>
      confirmPaidRegistration({
        userId,
        gameId: game.id,
        amountCents: 1500,
        method: "Card",
        stripeId: `dev_${runId}_${i}`,
        stripeSessionId: `cs_${runId}_${i}`,
      })
    )
  );

  const statuses = results.map((r) => r.status).sort();
  assert.deepEqual(statuses, ["confirmed", "confirmed", "no_spot"]);
  const confirmed = await db.registration.count({
    where: { gameId: game.id, status: "CONFIRMED" },
  });
  assert.equal(confirmed, 2);
  const owed = await db.payment.findMany({ where: { gameId: game.id, refundDue: true } });
  assert.equal(owed.length, 1);
});

test("a repeated Stripe session is recorded once", async () => {
  const game = await makeGame(5);
  const userId = await makeUser("dup");
  const opts = {
    userId,
    gameId: game.id,
    amountCents: 1500,
    method: "Card",
    stripeSessionId: `cs_${runId}_dup`,
  };
  const [first, second] = [await confirmPaidRegistration(opts), await confirmPaidRegistration(opts)];
  assert.equal(first.status, "confirmed");
  assert.equal(second.status, "duplicate");
  assert.equal(await db.payment.count({ where: { stripeSessionId: opts.stripeSessionId } }), 1);
});

test("lapsed offers and checkout holds are released and offered to the waitlist", async () => {
  const game = await makeGame(2);
  const [offered, holding, waitA, waitB] = await Promise.all(
    ["offered", "holding", "wait-a", "wait-b"].map((l) => makeUser(l))
  );
  const past = new Date(Date.now() - 60_000);
  await db.registration.createMany({
    data: [
      { userId: offered, gameId: game.id, status: "OFFERED", payStatus: "UNPAID", offerExpiresAt: past },
      { userId: holding, gameId: game.id, status: "PROVISIONAL", payStatus: "UNPAID", offerExpiresAt: past },
      { userId: waitA, gameId: game.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 1 },
      { userId: waitB, gameId: game.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 2 },
    ],
  });

  const released = await waitlist.sweepGameHolds(game.id);
  assert.equal(released, 2);

  const regs = await db.registration.findMany({ where: { gameId: game.id } });
  const byUser = new Map(regs.map((r) => [r.userId, r]));
  assert.equal(byUser.get(offered)?.status, "CANCELLED");
  assert.equal(byUser.get(holding)?.status, "CANCELLED");
  assert.equal(byUser.get(waitA)?.status, "OFFERED");
  assert.equal(byUser.get(waitB)?.status, "OFFERED");
  assert.ok(byUser.get(waitA)?.offerExpiresAt);
  assert.equal(await db.notification.count({ where: { userId: waitA, kind: "OFFER" } }), 1);
  assert.equal(await db.notification.count({ where: { userId: offered, kind: "WAITLIST" } }), 1);
});

test("pay-later reservations without an expiry are never swept", async () => {
  const game = await makeGame(3);
  const userId = await makeUser("later");
  await db.registration.create({
    data: { userId, gameId: game.id, status: "PROVISIONAL", payStatus: "UNPAID" },
  });
  await waitlist.sweepAllHolds();
  const reg = await db.registration.findFirstOrThrow({ where: { userId, gameId: game.id } });
  assert.equal(reg.status, "PROVISIONAL");
});

test("promoteWaitlist only offers as many spots as are open", async () => {
  const game = await makeGame(2, "FREE");
  const [inGame, w1, w2] = await Promise.all(["in", "w1", "w2"].map((l) => makeUser(l)));
  await db.registration.createMany({
    data: [
      { userId: inGame, gameId: game.id, status: "CONFIRMED", payStatus: "FREE" },
      { userId: w1, gameId: game.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 1 },
      { userId: w2, gameId: game.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 2 },
    ],
  });
  await db.$transaction((tx) => waitlist.promoteWaitlist(tx, game.id));
  const offered = await db.registration.findMany({ where: { gameId: game.id, status: "OFFERED" } });
  assert.deepEqual(offered.map((r) => r.userId), [w1]);
  assert.equal(offered[0].payStatus, "FREE");
  // The player still waiting moves up to the front of the line.
  const remaining = await db.registration.findFirstOrThrow({ where: { userId: w2, gameId: game.id } });
  assert.equal(remaining.waitlistPos, 1);
});

test("refunds cover test payments but leave in-person payments to the organizer", async () => {
  const game = await makeGame(5);
  const userId = await makeUser("refund");
  await db.payment.createMany({
    data: [
      { userId, gameId: game.id, amountCents: 1500, status: "SUCCEEDED", stripeId: `dev_${runId}_r` },
      { userId, gameId: game.id, amountCents: 1500, status: "SUCCEEDED", method: "In person" },
    ],
  });
  assert.equal(await refunds.refundGamePayments(userId, game.id), true);
  const payments = await db.payment.findMany({ where: { userId, gameId: game.id } });
  const statuses = payments.map((p) => `${p.stripeId ? "dev" : "offline"}:${p.status}`).sort();
  assert.deepEqual(statuses, ["dev:REFUNDED", "offline:SUCCEEDED"]);
});

test("owed refunds are retried by the scheduled sweep", async () => {
  const game = await makeGame(5);
  const userId = await makeUser("owed");
  const payment = await db.payment.create({
    data: {
      userId,
      gameId: game.id,
      amountCents: 1500,
      status: "SUCCEEDED",
      stripeId: `dev_${runId}_owed`,
      refundDue: true,
    },
  });
  await refunds.processDueRefunds();
  const after = await db.payment.findUniqueOrThrow({ where: { id: payment.id } });
  assert.equal(after.status, "REFUNDED");
  assert.equal(after.refundDue, false);
});
