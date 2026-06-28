import type { AuditAction, Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { createHash } from "node:crypto";
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

export function auditHashPayload(input: {
  action: string;
  actorId?: string | null;
  targetType: string;
  targetId: string;
  organizationId?: string | null;
  reason?: string | null;
  metadata?: unknown;
  previousHash?: string | null;
  createdAt: Date;
}) {
  return JSON.stringify({
    action: input.action,
    actorId: input.actorId ?? null,
    targetType: input.targetType,
    targetId: input.targetId,
    organizationId: input.organizationId ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    previousHash: input.previousHash ?? null,
    createdAt: input.createdAt.toISOString(),
  });
}

export function computeAuditHash(payload: string) {
  return createHash("sha256").update(payload).digest("hex");
}

export async function writeAuditLog(input: AuditInput, client: AuditDb = db) {
  const previous = await client.auditLogEntry.findFirst({
    orderBy: { createdAt: "desc" },
    select: { hash: true },
  });
  const createdAt = new Date();
  const previousHash = previous?.hash ?? null;
  const metadata = input.metadata ?? {};
  const hash = computeAuditHash(
    auditHashPayload({
      action: input.action,
      actorId: input.actorId,
      targetType: input.targetType,
      targetId: input.targetId,
      organizationId: input.organizationId,
      reason: input.reason,
      metadata,
      previousHash,
      createdAt,
    })
  );

  await client.auditLogEntry.create({
    data: {
      action: input.action,
      actorId: input.actorId,
      targetType: input.targetType,
      targetId: input.targetId,
      organizationId: input.organizationId,
      reason: input.reason,
      metadata,
      previousHash,
      hash,
      createdAt,
    },
  });
}
