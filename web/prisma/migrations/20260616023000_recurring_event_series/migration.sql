-- Weekly recurring pickup series.
-- Each occurrence remains a normal Game row so registrations, waitlists,
-- payments, attendance, and cancellations stay occurrence-specific.

CREATE TYPE "RecurrenceCadence" AS ENUM ('WEEKLY');
CREATE TYPE "SeriesPaymentMode" AS ENUM ('PER_GAME', 'UPFRONT', 'WEEKLY_RECURRING');

CREATE TABLE "RecurringEventSeries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cadence" "RecurrenceCadence" NOT NULL DEFAULT 'WEEKLY',
    "intervalWeeks" INTEGER NOT NULL DEFAULT 1,
    "occurrenceCount" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "durationMins" INTEGER NOT NULL DEFAULT 90,
    "format" TEXT NOT NULL DEFAULT '7-a-side',
    "skill" TEXT NOT NULL DEFAULT 'Intermediate',
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 14,
    "model" "GameModel" NOT NULL DEFAULT 'PAY',
    "paymentMode" "SeriesPaymentMode" NOT NULL DEFAULT 'PER_GAME',
    "policy" TEXT NOT NULL DEFAULT 'Full refund up to 24h before kickoff. No refund after.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RecurringEventSeries_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Game" ADD COLUMN "seriesId" TEXT;
ALTER TABLE "Game" ADD COLUMN "occurrenceIndex" INTEGER;

CREATE INDEX "RecurringEventSeries_orgId_idx" ON "RecurringEventSeries"("orgId");
CREATE INDEX "RecurringEventSeries_createdById_idx" ON "RecurringEventSeries"("createdById");
CREATE INDEX "RecurringEventSeries_startsAt_idx" ON "RecurringEventSeries"("startsAt");
CREATE INDEX "RecurringEventSeries_archivedAt_idx" ON "RecurringEventSeries"("archivedAt");

CREATE INDEX "Game_seriesId_idx" ON "Game"("seriesId");
CREATE UNIQUE INDEX "Game_seriesId_occurrenceIndex_key" ON "Game"("seriesId", "occurrenceIndex");

ALTER TABLE "RecurringEventSeries"
  ADD CONSTRAINT "RecurringEventSeries_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecurringEventSeries"
  ADD CONSTRAINT "RecurringEventSeries_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Game"
  ADD CONSTRAINT "Game_seriesId_fkey"
  FOREIGN KEY ("seriesId") REFERENCES "RecurringEventSeries"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
