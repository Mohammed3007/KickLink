import test from "node:test";
import assert from "node:assert/strict";
import {
  analyticsEventSchema,
  clientIpFromHeaders,
  hashIp,
  sanitizePath,
} from "../lib/analytics";

test("analyticsEventSchema accepts a page view payload", () => {
  const parsed = analyticsEventSchema.safeParse({
    type: "PAGE_VIEW",
    name: "page_view",
    path: "/games?sport=Football",
    referrer: "https://kick-link.vercel.app/",
    title: "Games",
    visitorId: "visitor-123",
    sessionId: "session-123",
    metadata: { source: "client" },
  });

  assert.equal(parsed.success, true);
});

test("analyticsEventSchema rejects malformed event names", () => {
  assert.equal(
    analyticsEventSchema.safeParse({
      type: "USER_EVENT",
      name: "<script>alert(1)</script>",
      path: "/",
      visitorId: "visitor-123",
    }).success,
    false
  );
});

test("analyticsEventSchema trims metadata size and sanitizes values", () => {
  const parsed = analyticsEventSchema.parse({
    type: "USER_EVENT",
    name: "game.join_paid_click",
    path: "/games/123",
    visitorId: "visitor-123",
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

test("clientIpFromHeaders and hashIp avoid storing raw IP addresses", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.42, 198.51.100.1",
  });

  const ip = clientIpFromHeaders(headers);
  const hashed = hashIp(ip, "test-salt");

  assert.equal(ip, "203.0.113.42");
  assert.notEqual(hashed, ip);
  assert.equal(hashed?.length, 32);
});
