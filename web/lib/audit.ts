import type { AuditAction, Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";

type AuditDb = PrismaClient | Prisma.TransactionClient;

type AuditInput = {
  action: AuditAction;
  actorId?: string;
  targetType: string;
  targetId: string;
  organizationId?: string;
  reason?: string;
  metadata?: Prisma.InputJsonObject;
};

export async function writeAuditLog(input: AuditInput, client: AuditDb = db) {
  await client.auditLogEntry.create({
    data: {
      action: input.action,
      actorId: input.actorId,
      targetType: input.targetType,
      targetId: input.targetId,
      organizationId: input.organizationId,
      reason: input.reason,
      metadata: input.metadata ?? {},
    },
  });
}
