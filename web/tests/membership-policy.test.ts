import test from "node:test";
import assert from "node:assert/strict";
import { hasPaidMembership, sessionPrice } from "../lib/membership-policy";
import { collectedPayments, pendingSessionPayments } from "../lib/payment-totals";

test("paid membership ends exactly at its paid-through instant", () => {
  const now = new Date("2026-11-24T12:00:00Z");
  assert.equal(hasPaidMembership(null, now), false);
  assert.equal(hasPaidMembership({ paidThrough: now }, now), false);
  assert.equal(hasPaidMembership({ paidThrough: new Date(now.getTime() + 1) }, now), true);
});

test("financial totals use actual member charges and held quotes, excluding waitlists and refunds", () => {
  assert.equal(collectedPayments([
    { status: "SUCCEEDED", amountCents: 1000, refundDue: false },
    { status: "SUCCEEDED", amountCents: 1500, refundDue: false },
    { status: "REFUNDED", amountCents: 1500, refundDue: false },
    { status: "SUCCEEDED", amountCents: 1500, refundDue: true },
  ]), 2500);
  assert.equal(pendingSessionPayments([
    { status: "PROVISIONAL", payStatus: "UNPAID", priceCents: 1000 },
    { status: "PROVISIONAL", payStatus: "UNPAID", priceCents: null },
    { status: "WAITLISTED", payStatus: "UNPAID", priceCents: null },
    { status: "CANCELLED", payStatus: "UNPAID", priceCents: 1500 },
  ], 1500), 2500);
});

test("only paid members receive member pricing, including zero-dollar spots", () => {
  const game = { model: "PAY", priceCents: 1500, memberPriceCents: 1000 };
  assert.equal(sessionPrice(game, false), 1500);
  assert.equal(sessionPrice(game, true), 1000);
  assert.equal(sessionPrice({ ...game, memberPriceCents: 0 }, true), 0);
  assert.equal(sessionPrice({ ...game, memberPriceCents: null }, true), 1500);
  assert.equal(sessionPrice({ ...game, model: "FREE" }, false), 0);
});
