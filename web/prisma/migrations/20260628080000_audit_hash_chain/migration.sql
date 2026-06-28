-- Add a tamper-evident hash chain to audit log entries.
-- New entries are chained in application code. Existing entries can be
-- backfilled if needed, but null values preserve compatibility.

ALTER TABLE "AuditLogEntry"
  ADD COLUMN "previousHash" TEXT,
  ADD COLUMN "hash" TEXT;

CREATE INDEX "AuditLogEntry_hash_idx" ON "AuditLogEntry"("hash");
