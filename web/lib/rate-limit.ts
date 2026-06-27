import { db } from "@/lib/db";

type LimitConfig = {
  scope: string;
  identifier: string;
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase().slice(0, 240);
}

export async function checkRateLimit(config: LimitConfig): Promise<RateLimitResult> {
  const identifier = normalizeIdentifier(config.identifier);
  if (!identifier) return { ok: false, retryAfterSeconds: Math.ceil(config.blockMs / 1000) };

  const now = new Date();
  const existing = await db.rateLimitBucket.findUnique({
    where: { scope_identifier: { scope: config.scope, identifier } },
  });

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000),
    };
  }

  if (!existing || now.getTime() - existing.windowStart.getTime() > config.windowMs) {
    await db.rateLimitBucket.upsert({
      where: { scope_identifier: { scope: config.scope, identifier } },
      create: {
        scope: config.scope,
        identifier,
        attempts: 1,
        windowStart: now,
        blockedUntil: null,
      },
      update: {
        attempts: 1,
        windowStart: now,
        blockedUntil: null,
      },
    });
    return { ok: true };
  }

  const attempts = existing.attempts + 1;
  const blockedUntil =
    attempts > config.maxAttempts ? new Date(now.getTime() + config.blockMs) : null;

  await db.rateLimitBucket.update({
    where: { id: existing.id },
    data: { attempts, blockedUntil },
  });

  if (blockedUntil) {
    return { ok: false, retryAfterSeconds: Math.ceil(config.blockMs / 1000) };
  }

  return { ok: true };
}

export async function clearRateLimit(scope: string, identifier: string) {
  await db.rateLimitBucket
    .delete({
      where: {
        scope_identifier: {
          scope,
          identifier: normalizeIdentifier(identifier),
        },
      },
    })
    .catch(() => undefined);
}

export function rateLimitMessage(result: Extract<RateLimitResult, { ok: false }>) {
  const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
  return `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
