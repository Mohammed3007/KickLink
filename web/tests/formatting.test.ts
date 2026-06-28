import test from "node:test";
import assert from "node:assert/strict";
import {
  APP_TIME_ZONE,
  formatDateChipParts,
  formatGameDate,
  formatTime,
} from "../lib/utils";

test("game date and checkout formatting use the shared app timezone", () => {
  const kickoff = new Date("2026-07-02T20:00:00.000Z");

  assert.equal(APP_TIME_ZONE, "UTC");
  assert.equal(formatGameDate(kickoff), "Thu, Jul 2");
  assert.equal(formatTime(kickoff), "8:00 p.m.");
  assert.deepEqual(formatDateChipParts(kickoff), {
    weekday: "THU",
    day: "2",
    month: "JUL",
  });
});
