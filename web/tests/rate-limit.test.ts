import test from "node:test";
import assert from "node:assert/strict";
import {
  nextRateLimitState,
  normalizeRateLimitIdentifier,
  rateLimitMessage,
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
