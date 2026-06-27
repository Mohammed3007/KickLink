CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RateLimitBucket_scope_identifier_key" ON "RateLimitBucket"("scope", "identifier");
CREATE INDEX "RateLimitBucket_blockedUntil_idx" ON "RateLimitBucket"("blockedUntil");
CREATE INDEX "RateLimitBucket_updatedAt_idx" ON "RateLimitBucket"("updatedAt");
