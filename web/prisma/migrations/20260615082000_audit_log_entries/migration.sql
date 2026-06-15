CREATE TYPE "AuditAction" AS ENUM (
  'ORGANIZER_APPLICATION_APPROVED',
  'ORGANIZER_APPLICATION_REJECTED',
  'ORGANIZATION_CREATED'
);

CREATE TABLE "AuditLogEntry" (
  "id" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "organizationId" TEXT,
  "actorId" TEXT,
  "reason" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLogEntry_actorId_idx" ON "AuditLogEntry"("actorId");
CREATE INDEX "AuditLogEntry_action_idx" ON "AuditLogEntry"("action");
CREATE INDEX "AuditLogEntry_organizationId_idx" ON "AuditLogEntry"("organizationId");
CREATE INDEX "AuditLogEntry_targetType_targetId_idx" ON "AuditLogEntry"("targetType", "targetId");
CREATE INDEX "AuditLogEntry_createdAt_idx" ON "AuditLogEntry"("createdAt");

ALTER TABLE "AuditLogEntry"
ADD CONSTRAINT "AuditLogEntry_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
