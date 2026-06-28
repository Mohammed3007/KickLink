import test from "node:test";
import assert from "node:assert/strict";
import {
  API_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  nextRateLimitState,
  normalizeRateLimitIdentifier,
  rateLimitBypassEnabled,
  rateLimitMessage,
  requestRateLimitIdentifier,
} from "../lib/rate-limit";

const now = new Date("2026-06-27T12:00:00.000Z");
const config = {
  maxAttempts: 3,
  windowMs: 10 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
};

test("normalizeRateLimitIdentifier trims, lowercases and caps identifiers", () => {
  assert.equal(normalizeRateLimitIdentifier("  USER@Example.COM  "), "user@example.com");
  assert.equal(normalizeRateLimitIdentifier("x".repeat(300)).length, 240);
});

test("auth rate limit policy is five attempts per fifteen minutes", () => {
  assert.deepEqual(AUTH_RATE_LIMIT, {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });
});

test("rate limit bypass is only available for explicit Playwright smoke runs", () => {
  const previousPlaywright = process.env.PLAYWRIGHT_TEST;
  const previousDisable = process.env.DISABLE_RATE_LIMITS;

  try {
    delete process.env.PLAYWRIGHT_TEST;
    process.env.DISABLE_RATE_LIMITS = "true";
    assert.equal(rateLimitBypassEnabled(), false);

    process.env.PLAYWRIGHT_TEST = "true";
    process.env.DISABLE_RATE_LIMITS = "true";
    assert.equal(rateLimitBypassEnabled(), true);
  } finally {
    if (previousPlaywright === undefined) delete process.env.PLAYWRIGHT_TEST;
    else process.env.PLAYWRIGHT_TEST = previousPlaywright;

    if (previousDisable === undefined) delete process.env.DISABLE_RATE_LIMITS;
    else process.env.DISABLE_RATE_LIMITS = previousDisable;
  }
});

test("api rate limit policy exists for non-auth endpoints", () => {
  assert.equal(API_RATE_LIMIT.maxAttempts > AUTH_RATE_LIMIT.maxAttempts, true);
  assert.equal(API_RATE_LIMIT.windowMs, 60 * 1000);
});

test("nextRateLimitState starts a new window on first attempt", () => {
  const next = nextRateLimitState(null, config, now);

  assert.equal(next.allowed, true);
  assert.equal(next.attempts, 1);
  assert.equal(next.windowStart, now);
  assert.equal(next.blockedUntil, null);
});

test("nextRateLimitState allows attempts up to the configured maximum", () => {
  const next = nextRateLimitState(
    { attempts: 2, windowStart: now, blockedUntil: null },
    config,
    new Date(now.getTime() + 1000)
  );

  assert.equal(next.allowed, true);
  assert.equal(next.attempts, 3);
  assert.equal(next.blockedUntil, null);
});

test("nextRateLimitState blocks the attempt after the configured maximum", () => {
  const next = nextRateLimitState(
    { attempts: 3, windowStart: now, blockedUntil: null },
    config,
    new Date(now.getTime() + 1000)
  );

  assert.equal(next.allowed, false);
  assert.equal(next.attempts, 4);
  assert.equal(next.blockedUntil?.toISOString(), "2026-06-27T12:15:01.000Z");
});

test("nextRateLimitState preserves an active block", () => {
  const blockedUntil = new Date(now.getTime() + 30_000);
  const next = nextRateLimitState(
    { attempts: 9, windowStart: now, blockedUntil },
    config,
    new Date(now.getTime() + 1000)
  );

  assert.equal(next.allowed, false);
  assert.equal(next.attempts, 9);
  assert.equal(next.blockedUntil, blockedUntil);
});

test("rateLimitMessage returns a generic wait message", () => {
  assert.equal(
    rateLimitMessage({ ok: false, retryAfterSeconds: 61 }),
    "Too many attempts. Try again in about 2 minutes."
  );
});

test("requestRateLimitIdentifier prefers forwarded IP headers", () => {
  const req = new Request("https://kick-link.vercel.app/api/health", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 198.51.100.1",
      "x-real-ip": "198.51.100.2",
    },
  });

  assert.equal(requestRateLimitIdentifier(req), "ip:203.0.113.10");
});
