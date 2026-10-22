-- Game times used to be entered via <input type="datetime-local"> and parsed on
-- the server, whose clock is UTC (Vercel, Docker). An organizer typing
-- "7:00 PM" in Ottawa was stored as 19:00 UTC (3 PM Eastern). The app now reads
-- that input as America/Toronto wall time, so shift existing rows to the
-- instant the organizer actually meant: keep the wall-clock time, change the
-- zone from UTC to America/Toronto.
--
-- If NEXT_PUBLIC_APP_TIME_ZONE is set to a different zone in production,
-- change 'America/Toronto' below to match before deploying.

UPDATE "Game"
SET "startsAt" = ("startsAt" AT TIME ZONE 'America/Toronto') AT TIME ZONE 'UTC';

UPDATE "RecurringEventSeries"
SET "startsAt" = ("startsAt" AT TIME ZONE 'America/Toronto') AT TIME ZONE 'UTC',
    "endsAt"   = ("endsAt"   AT TIME ZONE 'America/Toronto') AT TIME ZONE 'UTC';
