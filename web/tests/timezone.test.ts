import test from "node:test";
import assert from "node:assert/strict";
import { addWeeksInZone, parseLocalDateTime, wallTimeInZone } from "../lib/timezone";

const TORONTO = "America/Toronto";

test("datetime-local input is read as wall time in the app zone", () => {
  // July: Eastern Daylight Time, UTC-4.
  assert.equal(parseLocalDateTime("2026-07-02T19:00", TORONTO)?.toISOString(), "2026-07-02T23:00:00.000Z");
  // January: Eastern Standard Time, UTC-5.
  assert.equal(parseLocalDateTime("2026-01-15T19:00", TORONTO)?.toISOString(), "2026-01-16T00:00:00.000Z");
  assert.equal(parseLocalDateTime("2026-07-02T19:00", "UTC")?.toISOString(), "2026-07-02T19:00:00.000Z");
});

test("malformed local times are rejected", () => {
  assert.equal(parseLocalDateTime("2026-07-02T19:00:00.000Z", TORONTO), null);
  assert.equal(parseLocalDateTime("not a date", TORONTO), null);
  assert.equal(parseLocalDateTime("2026-13-02T19:00", TORONTO), null);
});

test("weekly series keep their local kickoff across the DST change", () => {
  // Thursdays at 7 PM, starting before clocks fall back on Nov 1, 2026.
  const first = parseLocalDateTime("2026-10-22T19:00", TORONTO)!;
  const series = [0, 1, 2, 3].map((week) => addWeeksInZone(first, week, TORONTO));
  for (const kickoff of series) {
    const wall = wallTimeInZone(kickoff, TORONTO);
    assert.equal(`${wall.hour}:${wall.minute}`, "19:0");
  }
  assert.deepEqual(
    series.map((d) => d.toISOString()),
    [
      "2026-10-22T23:00:00.000Z",
      "2026-10-29T23:00:00.000Z",
      "2026-11-06T00:00:00.000Z",
      "2026-11-13T00:00:00.000Z",
    ]
  );
});

test("adding weeks rolls over month and year boundaries", () => {
  const start = parseLocalDateTime("2026-12-24T10:30", TORONTO)!;
  const wall = wallTimeInZone(addWeeksInZone(start, 2, TORONTO), TORONTO);
  assert.deepEqual([wall.year, wall.month, wall.day, wall.hour, wall.minute], [2027, 1, 7, 10, 30]);
});
