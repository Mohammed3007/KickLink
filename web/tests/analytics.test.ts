import test from "node:test";
import assert from "node:assert/strict";
import {
  analyticsEventSchema,
  clientIpFromHeaders,
  coarseLocation,
  deviceFromUserAgent,
  isBot,
  optedOut,
  referrerHost,
  sanitizePath,
  visitorHash,
} from "../lib/analytics";

test("analyticsEventSchema accepts a page view payload", () => {
  const parsed = analyticsEventSchema.safeParse({
    type: "PAGE_VIEW",
    name: "page_view",
    path: "/games?sport=Soccer",
    referrer: "https://www.google.com/",
    title: "Games",
    metadata: { source: "client" },
  });

  assert.equal(parsed.success, true);
});

test("analyticsEventSchema ignores identifiers sent by older clients", () => {
  const parsed = analyticsEventSchema.parse({
    type: "PAGE_VIEW",
    name: "page_view",
    path: "/home",
    visitorId: "visitor-123",
    sessionId: "session-123",
  });
  assert.equal("visitorId" in parsed, false);
  assert.equal("sessionId" in parsed, false);
});

test("analyticsEventSchema rejects malformed event names", () => {
  assert.equal(
    analyticsEventSchema.safeParse({
      type: "USER_EVENT",
      name: "<script>alert(1)</script>",
      path: "/",
    }).success,
    false
  );
});

test("analyticsEventSchema trims metadata size and sanitizes values", () => {
  const parsed = analyticsEventSchema.parse({
    type: "USER_EVENT",
    name: "game.join_paid_click",
    path: "/games/123",
    metadata: Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => [`key-${index}`, ` value-${index}\u0000 `])
    ),
  });

  assert.equal(Object.keys(parsed.metadata).length, 12);
  assert.equal(parsed.metadata["key-0"], "value-0");
});

test("sanitizePath rejects external paths", () => {
  assert.equal(sanitizePath("https://evil.example/path"), "/");
  assert.equal(sanitizePath("//evil.example/path"), "/");
  assert.equal(sanitizePath("/home"), "/home");
});

test("sanitizePath drops tokens and search text but keeps campaign tags", () => {
  assert.equal(sanitizePath("/reset?token=secret-reset-token"), "/reset");
  assert.equal(sanitizePath("/verify?token=abc#done"), "/verify");
  assert.equal(sanitizePath("/games?sport=Soccer&q=Jane+Doe"), "/games?sport=Soccer");
  assert.equal(sanitizePath("/?utm_source=instagram&email=a%40b.c"), "/?utm_source=instagram");
});

test("referrerHost keeps only other sites' hosts", () => {
  assert.equal(referrerHost("https://www.google.com/search?q=pickup+soccer", "kicklink.ca"), "www.google.com");
  assert.equal(referrerHost("https://kicklink.ca/games", "kicklink.ca"), "");
  assert.equal(referrerHost("", "kicklink.ca"), "");
  assert.equal(referrerHost("javascript:alert(1)", "kicklink.ca"), "");
});

test("visitorHash is stable within a day and unrelated across salts", () => {
  const ua = "Mozilla/5.0 (iPhone)";
  const today = visitorHash("salt-today", "203.0.113.42", ua);
  assert.equal(today, visitorHash("salt-today", "203.0.113.42", ua));
  assert.notEqual(today, visitorHash("salt-tomorrow", "203.0.113.42", ua));
  assert.equal(today.length, 32);
  assert.equal(today.includes("203.0.113.42"), false);
});

test("device, bot and opt-out detection", () => {
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148"), "mobile");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 18_0)"), "tablet");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)"), "desktop");
  assert.equal(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isBot(""), true);
  assert.equal(isBot("Mozilla/5.0 (Windows NT 10.0) Chrome/130"), false);
  assert.equal(optedOut(new Headers({ "sec-gpc": "1" })), true);
  assert.equal(optedOut(new Headers()), false);
});

test("coarseLocation reads only country and region codes", () => {
  const headers = new Headers({
    "x-vercel-ip-country": "ca",
    "x-vercel-ip-country-region": "ON",
    "x-vercel-ip-city": "Ottawa",
  });
  assert.deepEqual(coarseLocation(headers), { country: "CA", region: "ON" });
});

test("clientIpFromHeaders reads the forwarded client address", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.1, 203.0.113.42",
  });
  assert.equal(clientIpFromHeaders(headers), "203.0.113.42");
});
