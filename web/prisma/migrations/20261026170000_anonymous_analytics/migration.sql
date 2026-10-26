-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN "device" TEXT NOT NULL DEFAULT '',
ADD COLUMN "country" TEXT NOT NULL DEFAULT '',
ADD COLUMN "region" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "AnalyticsSalt" (
    "day" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSalt_pkey" PRIMARY KEY ("day")
);

-- Bring events recorded before analytics became anonymous in line with the
-- privacy policy: drop query strings (which could hold sign-in tokens),
-- account links, IP hashes and user-agents, keep only the referring host,
-- and turn the long-lived visitor IDs into per-day ones.
UPDATE "AnalyticsEvent" SET
  "path" = split_part("path", '?', 1),
  "referrer" = COALESCE(substring("referrer" from '^[a-zA-Z][a-zA-Z0-9+.-]*://([^/?#:]+)'), ''),
  "visitorId" = md5("visitorId" || ':' || to_char("createdAt", 'YYYY-MM-DD')),
  "sessionId" = NULL,
  "userId" = NULL,
  "ipHash" = NULL,
  "userAgent" = '';
