CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'NO_SHOW');

CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "registrationId" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "recordedById" TEXT,

  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttendanceRecord_registrationId_key" ON "AttendanceRecord"("registrationId");
CREATE INDEX "AttendanceRecord_gameId_idx" ON "AttendanceRecord"("gameId");
CREATE INDEX "AttendanceRecord_userId_idx" ON "AttendanceRecord"("userId");
CREATE INDEX "AttendanceRecord_recordedById_idx" ON "AttendanceRecord"("recordedById");
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");

ALTER TABLE "AttendanceRecord"
ADD CONSTRAINT "AttendanceRecord_registrationId_fkey"
FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttendanceRecord"
ADD CONSTRAINT "AttendanceRecord_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttendanceRecord"
ADD CONSTRAINT "AttendanceRecord_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttendanceRecord"
ADD CONSTRAINT "AttendanceRecord_recordedById_fkey"
FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
