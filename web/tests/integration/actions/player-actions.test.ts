// Player-side server actions (lib/actions/games.ts, lib/actions/payments.ts)
// exercised end to end against a real Postgres.
import test, { after, before, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { actAs, fixtures, harness, installMocks, NotSignedIn } from "../helpers/harness";

let db: Awaited<ReturnType<typeof installMocks>>;
let fx: ReturnType<typeof fixtures>;
let games: typeof import("../../../lib/actions/games");
let payments: typeof import("../../../lib/actions/payments");
let manage: typeof import("../../../lib/actions/manage");

let owner: { id: string };
let orgId = "";

before(async () => {
  db = await installMocks();
  fx = fixtures(db);
  games = await import("../../../lib/actions/games");
  payments = await import("../../../lib/actions/payments");
  manage = await import("../../../lib/actions/manage");
  owner = await fx.user("owner", { organizerApproved: true });
  orgId = (await fx.club(owner.id, { chargesEnabled: true })).id;
});

after(async () => {
  await fx.cleanup();
  await db.$disconnect();
});

beforeEach(() => harness.reset());

const as = actAs;

describe("reserveSpot", () => {
  test("free game: confirmed and marked free", async () => {
    const g = await fx.game(orgId, { model: "FREE" });
    const p = await fx.member(orgId, "free");
    assert.deepEqual(await as(p.id, () => games.reserveSpot(g.id)), { ok: true });
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "CONFIRMED");
    assert.equal(r?.payStatus, "FREE");
  });

  test("pay-later game: provisional, unpaid, with no hold expiry", async () => {
    const g = await fx.game(orgId, { model: "LATER" });
    const p = await fx.member(orgId, "later");
    assert.deepEqual(await as(p.id, () => games.reserveSpot(g.id)), { ok: true });
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "PROVISIONAL");
    assert.equal(r?.payStatus, "UNPAID");
    assert.equal(r?.offerExpiresAt, null);
  });

  test("pay-now game can't be reserved without paying", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "paynow");
    const res = await as(p.id, () => games.reserveSpot(g.id));
    assert.equal(res.ok, false);
    assert.equal(await fx.reg(g.id, p.id), null);
  });

  test("non-members are turned away", async () => {
    const g = await fx.game(orgId);
    const outsider = await fx.user("outsider");
    const res = await as(outsider.id, () => games.reserveSpot(g.id));
    assert.deepEqual(res, { ok: false, error: "Join the club to register." });
  });

  test("signed-out callers are rejected before touching data", async () => {
    const g = await fx.game(orgId);
    await assert.rejects(games.reserveSpot(g.id), NotSignedIn);
  });

  test("unknown game", async () => {
    const p = await fx.member(orgId, "ghost");
    assert.deepEqual(await as(p.id, () => games.reserveSpot("nope")), { ok: false, error: "Game not found." });
  });

  test("double booking is refused", async () => {
    const g = await fx.game(orgId);
    const p = await fx.member(orgId, "twice");
    await as(p.id, () => games.reserveSpot(g.id));
    const res = await as(p.id, () => games.reserveSpot(g.id));
    assert.deepEqual(res, { ok: false, error: "You're already registered." });
  });

  test("full game is refused", async () => {
    const g = await fx.game(orgId, { capacity: 2 });
    for (const l of ["f1", "f2"]) {
      const p = await fx.member(orgId, l);
      await as(p.id, () => games.reserveSpot(g.id));
    }
    const late = await fx.member(orgId, "f3");
    assert.deepEqual(await as(late.id, () => games.reserveSpot(g.id)), { ok: false, error: "This game is full." });
  });

  test("closed once the game has started", async () => {
    const g = await fx.game(orgId, { startsInHours: -1 });
    const p = await fx.member(orgId, "late");
    const res = await as(p.id, () => games.reserveSpot(g.id));
    assert.deepEqual(res, { ok: false, error: "Registration is closed for this game." });
  });

  test("12 players racing for 5 spots never overfill the game", async () => {
    const g = await fx.game(orgId, { capacity: 5 });
    const players = await Promise.all(Array.from({ length: 12 }, (_, i) => fx.member(orgId, `race${i}`)));
    const results = await Promise.all(players.map((p) => as(p.id, () => games.reserveSpot(g.id))));
    assert.equal(results.filter((r) => r.ok).length, 5);
    assert.equal(await fx.occupied(g.id), 5);
  });

  test("a cancelled player can register again", async () => {
    const g = await fx.game(orgId);
    const p = await fx.member(orgId, "again");
    await as(p.id, () => games.reserveSpot(g.id));
    await as(p.id, () => games.cancelRegistration(g.id));
    assert.deepEqual(await as(p.id, () => games.reserveSpot(g.id)), { ok: true });
    assert.equal((await fx.reg(g.id, p.id))?.status, "CONFIRMED");
  });
});

describe("waitlist", () => {
  test("can't join while spots are open", async () => {
    const g = await fx.game(orgId, { capacity: 3 });
    const p = await fx.member(orgId, "eager");
    const res = await as(p.id, () => games.joinWaitlist(g.id));
    assert.deepEqual(res, { ok: false, error: "Spots are open. Reserve one instead." });
  });

  test("positions are handed out in order and double joins are refused", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "holder");
    await as(holder.id, () => games.reserveSpot(g.id));
    const [a, b, c] = await Promise.all(["wa", "wb", "wc"].map((l) => fx.member(orgId, l)));
    for (const p of [a, b, c]) assert.deepEqual(await as(p.id, () => games.joinWaitlist(g.id)), { ok: true });
    assert.deepEqual(
      [(await fx.reg(g.id, a.id))?.waitlistPos, (await fx.reg(g.id, b.id))?.waitlistPos, (await fx.reg(g.id, c.id))?.waitlistPos],
      [1, 2, 3]
    );
    assert.equal((await as(a.id, () => games.joinWaitlist(g.id))).ok, false);
  });

  test("concurrent joins still get unique, gap-free positions", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "holder2");
    await as(holder.id, () => games.reserveSpot(g.id));
    const joiners = await Promise.all(Array.from({ length: 8 }, (_, i) => fx.member(orgId, `wj${i}`)));
    await Promise.all(joiners.map((p) => as(p.id, () => games.joinWaitlist(g.id))));
    const positions = (await fx.regs(g.id)).filter((r) => r.status === "WAITLISTED").map((r) => r.waitlistPos).sort((x, y) => x! - y!);
    assert.deepEqual(positions, [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test("leaving the waitlist renumbers everyone behind", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "h3");
    await as(holder.id, () => games.reserveSpot(g.id));
    const [a, b, c] = await Promise.all(["la", "lb", "lc"].map((l) => fx.member(orgId, l)));
    for (const p of [a, b, c]) await as(p.id, () => games.joinWaitlist(g.id));
    await as(a.id, () => games.cancelRegistration(g.id));
    assert.equal((await fx.reg(g.id, b.id))?.waitlistPos, 1);
    assert.equal((await fx.reg(g.id, c.id))?.waitlistPos, 2);
    assert.equal(await fx.occupied(g.id), 1, "leaving the waitlist doesn't free a spot");
  });

  test("a freed spot is offered to #1 with a window, a notification and an email", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "h4");
    await as(holder.id, () => games.reserveSpot(g.id));
    const [a, b] = await Promise.all(["oa", "ob"].map((l) => fx.member(orgId, l)));
    await as(a.id, () => games.joinWaitlist(g.id));
    await as(b.id, () => games.joinWaitlist(g.id));

    await as(holder.id, () => games.cancelRegistration(g.id));
    const ra = await fx.reg(g.id, a.id);
    assert.equal(ra?.status, "OFFERED");
    assert.ok(ra?.offerExpiresAt && ra.offerExpiresAt > new Date());
    assert.equal(ra?.waitlistPos, null);
    assert.equal((await fx.reg(g.id, b.id))?.waitlistPos, 1, "next in line moves up");
    const notes = await db.notification.findMany({ where: { userId: a.id, kind: "OFFER" } });
    assert.equal(notes.length, 1);
  });

  test("declining an offer passes it to the next player", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "h5");
    await as(holder.id, () => games.reserveSpot(g.id));
    const [a, b] = await Promise.all(["da", "db"].map((l) => fx.member(orgId, l)));
    await as(a.id, () => games.joinWaitlist(g.id));
    await as(b.id, () => games.joinWaitlist(g.id));
    await as(holder.id, () => games.cancelRegistration(g.id));

    assert.deepEqual(await as(a.id, () => games.declineOffer(g.id)), { ok: true });
    assert.equal((await fx.reg(g.id, a.id))?.status, "CANCELLED");
    assert.equal((await fx.reg(g.id, b.id))?.status, "OFFERED");
    assert.deepEqual(await as(a.id, () => games.declineOffer(g.id)), { ok: false, error: "No active offer." });
  });

  test("accepting: free → confirmed, pay-later → provisional, pay-now → needs checkout", async () => {
    for (const [model, status] of [["FREE", "CONFIRMED"], ["LATER", "PROVISIONAL"], ["PAY", null]] as const) {
      const g = await fx.game(orgId, { capacity: 1, model });
      const holder = await fx.member(orgId, `ah-${model}`);
      if (model === "PAY") await as(holder.id, () => payments.devCompletePayment(g.id));
      else await as(holder.id, () => games.reserveSpot(g.id));
      const w = await fx.member(orgId, `aw-${model}`);
      await as(w.id, () => games.joinWaitlist(g.id));
      await as(holder.id, () => games.cancelRegistration(g.id));
      const res = await as(w.id, () => games.acceptOffer(g.id));
      if (status) {
        assert.deepEqual(res, { ok: true }, model);
        assert.equal((await fx.reg(g.id, w.id))?.status, status, model);
      } else {
        assert.deepEqual(res, { ok: false, error: "Checkout is required for this spot." });
      }
    }
  });

  test("an expired offer can't be accepted and moves on", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const holder = await fx.member(orgId, "h6");
    await as(holder.id, () => games.reserveSpot(g.id));
    const [a, b] = await Promise.all(["ea", "eb"].map((l) => fx.member(orgId, l)));
    await as(a.id, () => games.joinWaitlist(g.id));
    await as(b.id, () => games.joinWaitlist(g.id));
    await as(holder.id, () => games.cancelRegistration(g.id));
    await db.registration.updateMany({ where: { gameId: g.id, userId: a.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });

    const res = await as(a.id, () => games.acceptOffer(g.id));
    assert.equal(res.ok, false);
    assert.equal((await fx.reg(g.id, a.id))?.status, "CANCELLED");
    assert.equal((await fx.reg(g.id, b.id))?.status, "OFFERED");
  });

  test("viewing/joining sweeps lapsed holds so the spot isn't stuck", async () => {
    const g = await fx.game(orgId, { capacity: 1, model: "PAY" });
    const p = await fx.member(orgId, "abandon");
    harness.stripeEnabled = true;
    const checkout = await as(p.id, () => payments.createCheckout(g.id));
    assert.ok(checkout.url, JSON.stringify(checkout));
    harness.stripeEnabled = false;
    await db.registration.updateMany({ where: { gameId: g.id, userId: p.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });

    const next = await fx.member(orgId, "next");
    assert.deepEqual(await as(next.id, () => payments.devCompletePayment(g.id)), { ok: true });
    assert.equal((await fx.reg(g.id, p.id))?.status, "CANCELLED");
    assert.equal((await fx.reg(g.id, next.id))?.status, "CONFIRMED");
  });
});

describe("payments", () => {
  test("test-payment path confirms a pay-now spot with a receipt", async () => {
    const g = await fx.game(orgId, { model: "PAY", priceCents: 1500 });
    const p = await fx.member(orgId, "payer");
    assert.deepEqual(await as(p.id, () => payments.devCompletePayment(g.id)), { ok: true });
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "CONFIRMED");
    assert.equal(r?.payStatus, "PAID");
    const pay = await db.payment.findMany({ where: { gameId: g.id, userId: p.id } });
    assert.equal(pay.length, 1);
    assert.equal(pay[0].amountCents, 1500);
    assert.equal(pay[0].status, "SUCCEEDED");
    assert.equal(await db.notification.count({ where: { userId: p.id, kind: "RECEIPT" } }), 1);
  });

  test("paying for a full game is refused and charges nothing", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const a = await fx.member(orgId, "pa");
    await as(a.id, () => payments.devCompletePayment(g.id));
    const b = await fx.member(orgId, "pb");
    assert.deepEqual(await as(b.id, () => payments.devCompletePayment(g.id)), { ok: false, error: "This game just filled up." });
    assert.equal(await db.payment.count({ where: { gameId: g.id, userId: b.id } }), 0);
  });

  test("5 players paying for the last 2 spots at once: 2 confirmed, nobody else charged", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 2 });
    const ps = await Promise.all(Array.from({ length: 5 }, (_, i) => fx.member(orgId, `rush${i}`)));
    const res = await Promise.all(ps.map((p) => as(p.id, () => payments.devCompletePayment(g.id))));
    assert.equal(res.filter((r) => r.ok).length, 2);
    assert.equal(await fx.occupied(g.id), 2);
    const kept = await db.payment.count({ where: { gameId: g.id, status: "SUCCEEDED" } });
    assert.equal(kept, 2, "only the two confirmed players keep a charge");
  });

  test("pay-later player settles up with the test path", async () => {
    const g = await fx.game(orgId, { model: "LATER" });
    const p = await fx.member(orgId, "settle");
    await as(p.id, () => games.reserveSpot(g.id));
    assert.deepEqual(await as(p.id, () => payments.devCompletePayment(g.id)), { ok: true });
    assert.equal((await fx.reg(g.id, p.id))?.status, "CONFIRMED");
  });

  test("free games can't be paid for", async () => {
    const g = await fx.game(orgId, { model: "FREE" });
    const p = await fx.member(orgId, "freepay");
    assert.equal((await as(p.id, () => payments.devCompletePayment(g.id))).ok, false);
  });

  test("Stripe checkout: holds the spot 36 min, session expires at 31 min, pays the club", async () => {
    process.env.PLATFORM_FEE_BPS = "500";
    harness.stripeEnabled = true;
    const g = await fx.game(orgId, { model: "PAY", priceCents: 2000 });
    const p = await fx.member(orgId, "card");
    const before = Date.now();
    const res = await as(p.id, () => payments.createCheckout(g.id));
    delete process.env.PLATFORM_FEE_BPS;
    assert.ok(res.url);
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "PROVISIONAL");
    const holdMins = (r!.offerExpiresAt!.getTime() - before) / 60_000;
    assert.ok(holdMins > 35 && holdMins < 37, `hold ${holdMins}`);
    const s = harness.checkoutSessions[0] as {
      expires_at: number;
      payment_intent_data: { transfer_data: { destination: string }; application_fee_amount?: number };
      metadata: Record<string, string>;
    };
    const sessionMins = (s.expires_at * 1000 - before) / 60_000;
    assert.ok(sessionMins > 30 && sessionMins < 32, `session ${sessionMins}`);
    assert.equal(s.payment_intent_data.transfer_data.destination, "acct_test_club");
    assert.equal(s.payment_intent_data.application_fee_amount, 100);
    assert.equal(s.metadata.gameId, g.id);
    assert.equal(s.metadata.userId, p.id);
  });

  test("Stripe checkout is refused until the club finishes payout setup", async () => {
    harness.stripeEnabled = true;
    const o = await fx.user("o2", { organizerApproved: true });
    const unready = await fx.club(o.id, { chargesEnabled: false });
    const g = await fx.game(unready.id, { model: "PAY" });
    const p = await fx.member(unready.id, "unready");
    const res = await as(p.id, () => payments.createCheckout(g.id));
    assert.equal(res.error, "This club hasn't finished setting up payments yet.");
    assert.equal(await fx.reg(g.id, p.id), null, "no hold is taken");
  });

  test("retrying checkout doesn't take a second spot", async () => {
    harness.stripeEnabled = true;
    const g = await fx.game(orgId, { model: "PAY", capacity: 2 });
    const p = await fx.member(orgId, "retry");
    await as(p.id, () => payments.createCheckout(g.id));
    await as(p.id, () => payments.createCheckout(g.id));
    assert.equal(await fx.occupied(g.id), 1);
  });

  test("offered waitlist player can pay through checkout", async () => {
    harness.stripeEnabled = true;
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const holder = await fx.member(orgId, "ch");
    await as(holder.id, () => payments.devCompletePayment(g.id));
    const w = await fx.member(orgId, "cw");
    await as(w.id, () => games.joinWaitlist(g.id));
    await as(holder.id, () => games.cancelRegistration(g.id));
    assert.equal((await fx.reg(g.id, w.id))?.status, "OFFERED");
    const res = await as(w.id, () => payments.createCheckout(g.id));
    assert.ok(res.url, JSON.stringify(res));
    assert.equal((await fx.reg(g.id, w.id))?.status, "PROVISIONAL");
  });
});

describe("cancellation and refunds", () => {
  test("cancelling 24h+ before kickoff refunds the payment", async () => {
    const g = await fx.game(orgId, { model: "PAY", startsInHours: 48 });
    const p = await fx.member(orgId, "early");
    await as(p.id, () => payments.devCompletePayment(g.id));
    assert.deepEqual(await as(p.id, () => games.cancelRegistration(g.id)), { ok: true });
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "CANCELLED");
    assert.equal(r?.payStatus, "REFUNDED");
    assert.equal((await db.payment.findFirst({ where: { gameId: g.id, userId: p.id } }))?.status, "REFUNDED");
  });

  test("cancelling inside 24h releases the spot but the club keeps the fee", async () => {
    const g = await fx.game(orgId, { model: "PAY", startsInHours: 10 });
    const p = await fx.member(orgId, "lastmin");
    await as(p.id, () => payments.devCompletePayment(g.id));
    await as(p.id, () => games.cancelRegistration(g.id));
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "CANCELLED");
    assert.equal(r?.payStatus, "PAID");
    assert.equal((await db.payment.findFirst({ where: { gameId: g.id, userId: p.id } }))?.status, "SUCCEEDED");
    assert.equal(await fx.occupied(g.id), 0);
  });

  test("a card refund that Stripe rejects leaves the player registered", async () => {
    const g = await fx.game(orgId, { model: "PAY", startsInHours: 48 });
    const p = await fx.member(orgId, "stuck");
    await as(p.id, () => payments.devCompletePayment(g.id));
    await db.payment.updateMany({ where: { gameId: g.id, userId: p.id }, data: { stripeId: "pi_test_stuck" } });
    harness.stripeEnabled = true;
    harness.failRefunds = true;
    const res = await as(p.id, () => games.cancelRegistration(g.id));
    assert.equal(res.ok, false);
    assert.equal((await fx.reg(g.id, p.id))?.status, "CONFIRMED");
  });

  test("double-tapping cancel refunds once and promotes once", async () => {
    harness.stripeEnabled = true;
    const g = await fx.game(orgId, { model: "PAY", capacity: 1, startsInHours: 48 });
    const p = await fx.member(orgId, "dbl");
    await as(p.id, () => payments.devCompletePayment(g.id));
    await db.payment.updateMany({ where: { gameId: g.id, userId: p.id }, data: { stripeId: "pi_test_dbl" } });
    const [w1, w2] = await Promise.all(["dw1", "dw2"].map((l) => fx.member(orgId, l)));
    await as(w1.id, () => games.joinWaitlist(g.id));
    await as(w2.id, () => games.joinWaitlist(g.id));

    await Promise.all([as(p.id, () => games.cancelRegistration(g.id)), as(p.id, () => games.cancelRegistration(g.id))]);
    assert.equal(harness.refunds.length, 1, "Stripe asked to refund once (idempotency key)");
    assert.equal(await fx.occupied(g.id), 1, "only one spot freed and offered");
  });

  test("cancelling when not registered", async () => {
    const g = await fx.game(orgId);
    const p = await fx.member(orgId, "nobody");
    assert.deepEqual(await as(p.id, () => games.cancelRegistration(g.id)), { ok: false, error: "You're not registered." });
  });

  test("re-registering after a late cancellation: a later refund only returns the new payment", async () => {
    // Late cancel: club keeps payment #1. Player pays again (#2), then the
    // organizer removes them. Only #2 should come back; #1 was kept under policy.
    const g = await fx.game(orgId, { model: "PAY", startsInHours: 10, priceCents: 1000 });
    const p = await fx.member(orgId, "rejoin");
    await as(p.id, () => payments.devCompletePayment(g.id));
    await as(p.id, () => games.cancelRegistration(g.id));
    await as(p.id, () => payments.devCompletePayment(g.id));
    const r = await fx.reg(g.id, p.id);
    await as(owner.id, () => manage.removePlayer(r!.id));
    const pays = await db.payment.findMany({ where: { gameId: g.id, userId: p.id }, orderBy: { createdAt: "asc" } });
    assert.equal(pays.length, 2);
    assert.deepEqual(
      pays.map((x) => x.status),
      ["SUCCEEDED", "REFUNDED"],
      "the payment kept under the late-cancellation policy must not be refunded"
    );
  });
});
