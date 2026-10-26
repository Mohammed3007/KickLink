-- "Soccer" replaces "Football" as the default sport name (Canadian usage).
ALTER TABLE "Organization" ALTER COLUMN "sport" SET DEFAULT 'Soccer';
ALTER TABLE "Game" ALTER COLUMN "sport" SET DEFAULT 'Soccer';
ALTER TABLE "RecurringEventSeries" ALTER COLUMN "sport" SET DEFAULT 'Soccer';

UPDATE "Organization" SET "sport" = 'Soccer' WHERE "sport" = 'Football';
UPDATE "Game" SET "sport" = 'Soccer' WHERE "sport" = 'Football';
UPDATE "RecurringEventSeries" SET "sport" = 'Soccer' WHERE "sport" = 'Football';
