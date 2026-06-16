-- Keep Stripe Checkout webhook retries idempotent without blocking dev payments
-- whose stripeSessionId is intentionally null.
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_stripeSessionId_unique_not_null"
  ON "Payment"("stripeSessionId")
  WHERE "stripeSessionId" IS NOT NULL;
