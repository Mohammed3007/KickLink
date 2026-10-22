import { db } from "@/lib/db";
import { clientIpFromHeaders } from "@/lib/client-ip";

export const AUTH_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
} as const;

export const JOIN_CLUB_RATE_LIMIT = {
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
} as const;

/**
 * Per-account ceiling on password checks, independent of IP. Looser than
 * AUTH_RATE_LIMIT so a stranger can't lock a real user out with a few
 * guesses, but still caps distributed guessing against one account.
 */
export const AUTH_ACCOUNT_RATE_LIMIT = {
  maxAttempts: 20,
  windowMs: 60 * 60 * 1000,
  blockMs: 60 * 60 * 1000,
} as const;

/** Per-IP ceiling for auth forms, generous enough for shared networks. */
export const AUTH_IP_RATE_LIMIT = {
  maxAttempts: 30,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
} as const;

export const API_RATE_LIMIT = {
  maxAttempts: 60,
  windowMs: 60 * 1000,
  blockMs: 5 * 60 * 1000,
} as const;

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

type ExistingBucket = {
  attempts: number;
  windowStart: Date;
  blockedUntil: Date | null;
};

export function normalizeRateLimitIdentifier(identifier: string) {
  return identifier.trim().toLowerCase().slice(0, 240);
}

export function rateLimitBypassEnabled() {
  return (
    process.env.PLAYWRIGHT_TEST === "true" &&
    process.env.DISABLE_RATE_LIMITS === "true"
  );
}

export function nextRateLimitState(
  existing: ExistingBucket | null | undefined,
  config: Pick<LimitConfig, "maxAttempts" | "windowMs" | "blockMs">,
  now: Date
) {
  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return {
      allowed: false,
      attempts: existing.attempts,
      windowStart: existing.windowStart,
      blockedUntil: existing.blockedUntil,
    };
  }

  if (!existing || now.getTime() - existing.windowStart.getTime() > config.windowMs) {
    return {
      allowed: true,
      attempts: 1,
      windowStart: now,
      blockedUntil: null,
    };
  }

  const attempts = existing.attempts + 1;
  const blockedUntil =
    attempts > config.maxAttempts ? new Date(now.getTime() + config.blockMs) : null;

  return {
    allowed: !blockedUntil,
    attempts,
    windowStart: existing.windowStart,
    blockedUntil,
  };
}

export async function checkRateLimit(config: LimitConfig): Promise<RateLimitResult> {
  if (rateLimitBypassEnabled()) return { ok: true };

  const identifier = normalizeRateLimitIdentifier(config.identifier);
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

  const next = nextRateLimitState(existing, config, now);

  if (!existing || next.attempts === 1) {
    await db.rateLimitBucket.upsert({
      where: { scope_identifier: { scope: config.scope, identifier } },
      create: {
        scope: config.scope,
        identifier,
        attempts: next.attempts,
        windowStart: next.windowStart,
        blockedUntil: next.blockedUntil,
      },
      update: {
        attempts: next.attempts,
        windowStart: next.windowStart,
        blockedUntil: next.blockedUntil,
      },
    });
    return { ok: true };
  }

  await db.rateLimitBucket.update({
    where: { id: existing.id },
    data: { attempts: next.attempts, blockedUntil: next.blockedUntil },
  });

  if (!next.allowed) {
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
          identifier: normalizeRateLimitIdentifier(identifier),
        },
      },
    })
    .catch(() => undefined);
}

export function rateLimitMessage(result: Extract<RateLimitResult, { ok: false }>) {
  const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
  return `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export function requestRateLimitIdentifier(req: Request, prefix = "ip") {
  return `${prefix}:${clientIpFromHeaders(req.headers) ?? "unknown"}`;
}
