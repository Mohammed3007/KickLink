// The Stripe webhook route (app/api/stripe/webhook/route.ts) and the cron
// sweep route, driven with synthetic events. Signature checking is stubbed;
// its real logic is covered in tests/stripe-webhook.test.ts.
import test, { after, before, beforeEach, describe, mock } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { actAs, fixtures, harness, installMocks } from "../helpers/harness";

let db: Awaited<ReturnType<typeof installMocks>>;
let fx: ReturnType<typeof fixtures>;
let POST: (req: Request) => Promise<Response>;
let cronGET: (req: Request) => Promise<Response>;
let payments: typeof import("../../../lib/actions/payments");
let games: typeof import("../../../lib/actions/games");
let orgId = "";

const root = path.resolve(import.meta.dirname, "../../..");

before(async () => {
  db = await installMocks();
  mock.module(pathToFileURL(path.join(root, "lib/stripe-webhook.ts")).href, {
    namedExports: {
      stripeWebhookSecrets: () => ["whsec_test"],
      verifyStripeEvent: (_stripe: unknown, body: string, sig: string) => {
        if (sig !== "valid") throw new Error("No signatures found matching the expected signature");
        return JSON.parse(body);
      },
    },
  });
  fx = fixtures(db);
  POST = (await import("../../../app/api/stripe/webhook/route")).POST;
  cronGET = (await import("../../../app/api/cron/sweep/route")).GET;
  payments = await import("../../../lib/actions/payments");
  games = await import("../../../lib/actions/games");
  const o = await fx.user("wh-o", { organizerApproved: true });
  orgId = (await fx.club(o.id, { chargesEnabled: true })).id;
});

after(async () => {
  await fx.cleanup();
  await db.$disconnect();
});

beforeEach(() => {
  harness.reset();
  harness.stripeEnabled = true;
});

function deliver(event: Record<string, unknown>, sig = "valid") {
  return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: JSON.stringify(event), headers: { "stripe-signature": sig } }));
}

let seq = 0;
function completed(userId: string, gameId: string, extra: Record<string, unknown> = {}) {
  seq += 1;
  return {
    id: `evt_${seq}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_${fx.runId}_${seq}`,
        payment_status: "paid",
        amount_total: 1200,
        payment_intent: `pi_${fx.runId}_${seq}`,
        metadata: { userId, gameId },
        ...extra,
      },
    },
  };
}

describe("checkout.session.completed", () => {
  test("bad signatures are rejected", async () => {
    const res = await deliver({ type: "checkout.session.completed" }, "forged");
    assert.equal(res.status, 400);
  });

  test("confirms the held spot and records the card payment", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "whp");
    await actAs(p.id, () => payments.createCheckout(g.id));
    const res = await deliver(completed(p.id, g.id));
    assert.equal(res.status, 200);
    const r = await fx.reg(g.id, p.id);
    assert.equal(r?.status, "CONFIRMED");
    assert.equal(r?.payStatus, "PAID");
    const pay = await db.payment.findFirst({ where: { gameId: g.id, userId: p.id } });
    assert.equal(pay?.amountCents, 1200);
    assert.ok(pay?.stripeId?.startsWith("pi_"));
  });

  test("a redelivered event is recorded once", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "whdup");
    await actAs(p.id, () => payments.createCheckout(g.id));
    const ev = completed(p.id, g.id);
    await Promise.all([deliver(ev), deliver(ev), deliver(ev)]);
    assert.equal(await db.payment.count({ where: { gameId: g.id, userId: p.id } }), 1);
  });

  test("payment for a spot that's gone is refunded through Stripe", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const [late, winner] = await Promise.all(["whl", "whw"].map((l) => fx.member(orgId, l)));
    await actAs(late.id, () => payments.createCheckout(g.id));
    await db.registration.updateMany({ where: { gameId: g.id, userId: late.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });
    harness.stripeEnabled = false;
    await actAs(winner.id, () => payments.devCompletePayment(g.id)); // sweeps the late hold, takes the spot
    harness.stripeEnabled = true;

    const res = await deliver(completed(late.id, g.id));
    assert.equal(res.status, 200);
    assert.equal((await fx.reg(g.id, late.id))?.status, "CANCELLED");
    const pay = await db.payment.findFirst({ where: { gameId: g.id, userId: late.id } });
    assert.equal(pay?.status, "REFUNDED");
    assert.equal(harness.refunds.length, 1);
  });

  test("unpaid sessions (e.g. delayed bank debits) don't confirm anything", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "whu");
    await actAs(p.id, () => payments.createCheckout(g.id));
    await deliver(completed(p.id, g.id, { payment_status: "unpaid" }));
    assert.equal((await fx.reg(g.id, p.id))?.status, "PROVISIONAL");
  });

  test("checkout events from a connected account are ignored", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "whc");
    await actAs(p.id, () => payments.createCheckout(g.id));
    await deliver({ ...completed(p.id, g.id), account: "acct_somebody" });
    assert.equal((await fx.reg(g.id, p.id))?.status, "PROVISIONAL");
  });
});

describe("checkout.session.expired and account.updated", () => {
  test("an expired session releases the hold and offers the spot on", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const p = await fx.member(orgId, "whe");
    await actAs(p.id, () => payments.createCheckout(g.id));
    const w = await fx.member(orgId, "whew");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    // Stripe expires the session at 31 min; the hold (36 min) has ~5 left.
    await db.registration.updateMany({ where: { gameId: g.id, userId: p.id }, data: { offerExpiresAt: new Date(Date.now() + 5 * 60_000) } });
    await deliver({ id: "evt_exp", type: "checkout.session.expired", data: { object: { id: "cs_exp", metadata: { userId: p.id, gameId: g.id } } } });
    assert.equal((await fx.reg(g.id, p.id))?.status, "CANCELLED");
    assert.equal((await fx.reg(g.id, w.id))?.status, "OFFERED");
  });

  test("an old session expiring doesn't cancel a fresh retry", async () => {
    const g = await fx.game(orgId, { model: "PAY" });
    const p = await fx.member(orgId, "wher");
    await actAs(p.id, () => payments.createCheckout(g.id)); // fresh 36-min hold
    await deliver({ id: "evt_exp2", type: "checkout.session.expired", data: { object: { id: "cs_old", metadata: { userId: p.id, gameId: g.id } } } });
    assert.equal((await fx.reg(g.id, p.id))?.status, "PROVISIONAL");
  });

  test("account.updated flips the club's payout readiness", async () => {
    await db.organization.update({ where: { id: orgId }, data: { stripeAccountId: `acct_${fx.runId}`, chargesEnabled: false } });
    await deliver({ id: "evt_acct", type: "account.updated", account: `acct_${fx.runId}`, data: { object: { id: `acct_${fx.runId}`, charges_enabled: true } } });
    assert.equal((await db.organization.findUnique({ where: { id: orgId } }))?.chargesEnabled, true);
  });
});

describe("cron sweep", () => {
  test("requires the bearer secret", async () => {
    process.env.CRON_SECRET = "s3cret";
    assert.equal((await cronGET(new Request("http://localhost/api/cron/sweep"))).status, 401);
    assert.equal((await cronGET(new Request("http://localhost/api/cron/sweep", { headers: { authorization: "Bearer nope" } }))).status, 401);
    const ok = await cronGET(new Request("http://localhost/api/cron/sweep", { headers: { authorization: "Bearer s3cret" } }));
    assert.equal(ok.status, 200);
    delete process.env.CRON_SECRET;
    assert.equal((await cronGET(new Request("http://localhost/api/cron/sweep", { headers: { authorization: "Bearer " } }))).status, 401, "unset secret never authorizes");
  });

  test("releases lapsed holds, emails offers and retries owed refunds", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const p = await fx.member(orgId, "cr");
    await actAs(p.id, () => payments.createCheckout(g.id));
    const w = await fx.member(orgId, "crw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    await db.registration.updateMany({ where: { gameId: g.id, userId: p.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });
    const owed = await db.payment.create({
      data: { userId: p.id, gameId: g.id, amountCents: 1200, status: "SUCCEEDED", stripeId: `pi_owed_${fx.runId}`, refundDue: true },
    });

    process.env.CRON_SECRET = "s3cret";
    const res = await cronGET(new Request("http://localhost/api/cron/sweep", { headers: { authorization: "Bearer s3cret" } }));
    delete process.env.CRON_SECRET;
    assert.equal(res.status, 200);
    assert.equal((await fx.reg(g.id, w.id))?.status, "OFFERED");
    assert.ok(harness.offerEmails.some((e) => e.gameId === g.id));
    assert.equal((await db.payment.findUnique({ where: { id: owed.id } }))?.status, "REFUNDED");
  });
});
