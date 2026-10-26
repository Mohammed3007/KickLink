// Integration tests for analytics salt rotation and data retention against a
// real Postgres. Run with `npm run test:integration` (needs TEST_DATABASE_URL).
import test, { after, before } from "node:test";
import assert from "node:assert/strict";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error("Set TEST_DATABASE_URL to a disposable, migrated Postgres database.");
}
process.env.DATABASE_URL = testUrl;

let db: typeof import("../../lib/db").db;
let salts: typeof import("../../lib/analytics-salt");
let rateLimit: typeof import("../../lib/rate-limit");
const runId = `ar${Date.now().toString(36)}`;

before(async () => {
  ({ db } = await import("../../lib/db"));
  salts = await import("../../lib/analytics-salt");
  rateLimit = await import("../../lib/rate-limit");
});

after(async () => {
  await db.analyticsEvent.deleteMany({ where: { id: { startsWith: runId } } });
  await db.rateLimitBucket.deleteMany({ where: { identifier: { startsWith: runId } } });
  await db.$disconnect();
});

test("the daily salt is reused within a day and older salts are deleted", async () => {
  await db.analyticsSalt.deleteMany();
  await db.analyticsSalt.create({ data: { day: "2000-01-01", salt: "stale" } });

  const first = await salts.dailySalt();
  const second = await salts.dailySalt();
  assert.equal(first, second);
  assert.equal(first.length, 64);

  const remaining = await db.analyticsSalt.findMany();
  assert.equal(remaining.length, 1);
  assert.notEqual(remaining[0].day, "2000-01-01");
});

test("analytics older than 13 months are purged", async () => {
  const old = new Date();
  old.setMonth(old.getMonth() - 14);
  const base = { type: "PAGE_VIEW" as const, name: "page_view", path: "/", visitorId: "v" };
  await db.analyticsEvent.createMany({
    data: [
      { ...base, id: `${runId}-old`, createdAt: old },
      { ...base, id: `${runId}-new` },
    ],
  });

  await salts.purgeOldAnalytics();
  const left = await db.analyticsEvent.findMany({ where: { id: { startsWith: runId } } });
  assert.deepEqual(left.map((e) => e.id), [`${runId}-new`]);
});

test("idle rate-limit records are purged", async () => {
  await db.rateLimitBucket.createMany({
    data: [
      { scope: "test", identifier: `${runId}-idle` },
      { scope: "test", identifier: `${runId}-active` },
    ],
  });
  await db.$executeRaw`UPDATE "RateLimitBucket" SET "updatedAt" = now() - interval '2 days' WHERE identifier = ${`${runId}-idle`}`;

  await rateLimit.purgeStaleRateLimits();
  const left = await db.rateLimitBucket.findMany({ where: { identifier: { startsWith: runId } } });
  assert.deepEqual(left.map((b) => b.identifier), [`${runId}-active`]);
});
