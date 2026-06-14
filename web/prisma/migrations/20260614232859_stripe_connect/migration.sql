-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "stripeSessionId" TEXT;
