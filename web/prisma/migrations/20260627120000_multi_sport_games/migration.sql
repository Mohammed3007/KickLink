ALTER TABLE "Organization"
  ADD COLUMN "sport" TEXT NOT NULL DEFAULT 'Football';

ALTER TABLE "Game"
  ADD COLUMN "sport" TEXT NOT NULL DEFAULT 'Football';

ALTER TABLE "RecurringEventSeries"
  ADD COLUMN "sport" TEXT NOT NULL DEFAULT 'Football';

CREATE INDEX "Game_sport_idx" ON "Game"("sport");
CREATE INDEX "RecurringEventSeries_sport_idx" ON "RecurringEventSeries"("sport");
