-- Payments the club kept because the player cancelled after the refund
-- cutoff. Later refunds for the same game skip them.
ALTER TABLE "Payment" ADD COLUMN "keptAt" TIMESTAMP(3);

-- Backfill: a cancelled registration that is still PAID was a late
-- cancellation, so its successful payments were kept by the club.
UPDATE "Payment" p
SET "keptAt" = r."updatedAt"
FROM "Registration" r
WHERE r."userId" = p."userId"
  AND r."gameId" = p."gameId"
  AND r."status" = 'CANCELLED'
  AND r."payStatus" = 'PAID'
  AND p."status" = 'SUCCEEDED'
  AND p."refundDue" = false;
