// Wall-clock ↔ instant conversion for a named IANA time zone, using only Intl
// (no date library). Organizers type local times ("7:00 PM Tuesday"), the DB
// stores UTC instants, and weekly series must keep the same local time across
// daylight-saving changes.

type WallTime = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The local wall-clock time of an instant in a time zone. */
export function wallTimeInZone(date: Date, timeZone: string): WallTime & { second: number } {
  const parts = formatterFor(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Milliseconds the zone is ahead of UTC at a given instant. */
function zoneOffsetMs(date: Date, timeZone: string) {
  const wall = wallTimeInZone(date, timeZone);
  const wallAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  return wallAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The UTC instant at which the zone's clocks read the given wall time. */
export function zonedWallTimeToUtc(wall: WallTime, timeZone: string): Date {
  const wallAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  // Two passes settle the offset when the first guess lands across a DST change.
  let instant = wallAsUtc - zoneOffsetMs(new Date(wallAsUtc), timeZone);
  instant = wallAsUtc - zoneOffsetMs(new Date(instant), timeZone);
  return new Date(instant);
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;

/**
 * Parse an `<input type="datetime-local">` value ("2026-07-02T19:00") as a
 * wall time in `timeZone`. Returns null for anything else.
 */
export function parseLocalDateTime(value: string, timeZone: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const date = zonedWallTimeToUtc({ year, month, day, hour, minute }, timeZone);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Same local time `weeks` weeks later, staying on the wall clock across DST. */
export function addWeeksInZone(date: Date, weeks: number, timeZone: string): Date {
  const wall = wallTimeInZone(date, timeZone);
  const shifted = new Date(Date.UTC(wall.year, wall.month - 1, wall.day + weeks * 7));
  return zonedWallTimeToUtc(
    {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: wall.hour,
      minute: wall.minute,
    },
    timeZone
  );
}
