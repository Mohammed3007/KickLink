import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_REFUND_POLICY, isRefundable, REFUND_CUTOFF_HOURS } from "../lib/refund-policy";

const kickoff = new Date("2026-11-01T18:00:00.000Z");
const hoursBefore = (h: number) => new Date(kickoff.getTime() - h * 3_600_000);

test("cancelling at or before the cutoff is refundable", () => {
  assert.equal(isRefundable(kickoff, hoursBefore(REFUND_CUTOFF_HOURS)), true);
  assert.equal(isRefundable(kickoff, hoursBefore(72)), true);
});

test("cancelling inside the cutoff or after kickoff is not refundable", () => {
  assert.equal(isRefundable(kickoff, hoursBefore(REFUND_CUTOFF_HOURS - 0.01)), false);
  assert.equal(isRefundable(kickoff, hoursBefore(-1)), false);
});

test("the policy text matches the enforced cutoff", () => {
  assert.match(DEFAULT_REFUND_POLICY, new RegExp(`${REFUND_CUTOFF_HOURS}h`));
});
