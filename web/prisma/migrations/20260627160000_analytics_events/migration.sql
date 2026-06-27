-- Analytics event capture for page views and explicit user events.
-- Keep payloads intentionally small and avoid storing raw form values or secrets.

CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'USER_EVENT');

CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "type" "AnalyticsEventType" NOT NULL,
  "name" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL DEFAULT '',
  "visitorId" TEXT NOT NULL,
  "sessionId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "userAgent" TEXT NOT NULL DEFAULT '',
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,

  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AnalyticsEvent"
  ADD CONSTRAINT "AnalyticsEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");
CREATE INDEX "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");
CREATE INDEX "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
