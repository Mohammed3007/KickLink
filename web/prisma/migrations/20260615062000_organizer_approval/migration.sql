CREATE TYPE "PlatformRole" AS ENUM ('USER', 'ADMIN');

CREATE TYPE "OrganizerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "User"
ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "organizerApproved" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "OrganizerApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clubName" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "experience" TEXT NOT NULL,
  "expectedPlayers" INTEGER NOT NULL,
  "status" "OrganizerApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizerApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrganizerApplication_userId_idx" ON "OrganizerApplication"("userId");
CREATE INDEX "OrganizerApplication_status_idx" ON "OrganizerApplication"("status");

ALTER TABLE "OrganizerApplication"
ADD CONSTRAINT "OrganizerApplication_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizerApplication"
ADD CONSTRAINT "OrganizerApplication_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "User"
SET "organizerApproved" = true
WHERE "id" IN (
  SELECT DISTINCT "userId"
  FROM "Membership"
  WHERE "role" = 'ORGANIZER'
);

UPDATE "User"
SET "platformRole" = 'ADMIN'
WHERE "email" = 'organizer@kicklink.app';
