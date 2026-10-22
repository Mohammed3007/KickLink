-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundDue" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Payment_refundDue_idx" ON "Payment"("refundDue");
