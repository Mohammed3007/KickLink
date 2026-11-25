-- CreateEnum
CREATE TYPE "GameAccess" AS ENUM ('CLUB', 'OPEN', 'MEMBERS');


-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "memberWaitlistPriority" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "membershipEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthlyMembershipCents" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "yearlyMembershipCents" INTEGER NOT NULL DEFAULT 5000;

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "clubAccess" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "access" "GameAccess" NOT NULL DEFAULT 'CLUB',
ADD COLUMN     "leagueId" TEXT,
ADD COLUMN     "memberPriceCents" INTEGER;

-- AlterTable
ALTER TABLE "RecurringEventSeries" ADD COLUMN     "access" "GameAccess" NOT NULL DEFAULT 'CLUB',
ADD COLUMN     "leagueId" TEXT,
ADD COLUMN     "memberPriceCents" INTEGER;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "waitlistedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClubSubscription" (
    "amountCents" INTEGER NOT NULL DEFAULT 500,
    "checkoutAttemptId" TEXT,
    "lastEventCreated" INTEGER NOT NULL DEFAULT 0,
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "plan" "MembershipPlan" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "checkoutSessionId" TEXT,
    "checkoutExpiresAt" TIMESTAMP(3),
    "paidThrough" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'incomplete',
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipInvoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'cad',
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueEnrollment" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubSubscription_membershipId_key" ON "ClubSubscription"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubSubscription_stripeSubscriptionId_key" ON "ClubSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubSubscription_checkoutSessionId_key" ON "ClubSubscription"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipInvoice_stripeInvoiceId_key" ON "MembershipInvoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "League_orgId_idx" ON "League"("orgId");

-- CreateIndex
CREATE INDEX "LeagueEnrollment_userId_idx" ON "LeagueEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueEnrollment_leagueId_userId_key" ON "LeagueEnrollment"("leagueId", "userId");

-- AddForeignKey
ALTER TABLE "ClubSubscription" ADD CONSTRAINT "ClubSubscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipInvoice" ADD CONSTRAINT "MembershipInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ClubSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEnrollment" ADD CONSTRAINT "LeagueEnrollment_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEnrollment" ADD CONSTRAINT "LeagueEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringEventSeries" ADD CONSTRAINT "RecurringEventSeries_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve FIFO for existing queues when member-priority ordering is enabled.
WITH queue AS (
  SELECT id,
    min("createdAt") OVER (PARTITION BY "gameId") AS "queueStart",
    count(*) OVER (PARTITION BY "gameId") AS "queueSize",
    row_number() OVER (PARTITION BY "gameId" ORDER BY "waitlistPos" ASC NULLS LAST, "createdAt", id) AS position
  FROM "Registration" WHERE status = 'WAITLISTED'
)
UPDATE "Registration" AS registration
SET "waitlistedAt" = queue."queueStart" - (queue."queueSize" - queue.position) * interval '1 millisecond'
FROM queue WHERE registration.id = queue.id;
ALTER TABLE "Organization" ADD CONSTRAINT "membership_prices_positive" CHECK ("monthlyMembershipCents" > 0 AND "yearlyMembershipCents" > 0);
ALTER TABLE "Game" ADD CONSTRAINT "member_price_valid" CHECK ("memberPriceCents" IS NULL OR ("memberPriceCents" >= 0 AND "memberPriceCents" <= "priceCents"));
ALTER TABLE "RecurringEventSeries" ADD CONSTRAINT "series_member_price_valid" CHECK ("memberPriceCents" IS NULL OR ("memberPriceCents" >= 0 AND "memberPriceCents" <= "priceCents"));
ALTER TABLE "Registration" ADD CONSTRAINT "registration_price_nonnegative" CHECK ("priceCents" IS NULL OR "priceCents" >= 0);
