import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { APP_TIME_ZONE } from "@/lib/utils";

let cached: { day: string; salt: string } | null = null;

// Days follow the app's time zone so the dashboard's daily visitor counts
// line up with salt changes.
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(new Date());
}

/**
 * Today's analytics salt. The first request of the day creates it and
 * deletes every older salt, after which yesterday's visitor hashes can no
 * longer be linked to anyone.
 */
export async function dailySalt() {
  const day = today();
  if (cached?.day === day) return cached.salt;

  const existing = await db.analyticsSalt.findUnique({ where: { day } });
  if (existing) {
    cached = { day, salt: existing.salt };
    return existing.salt;
  }

  // Concurrent first requests race here; the upsert keeps whichever salt won.
  const created = await db.analyticsSalt.upsert({
    where: { day },
    create: { day, salt: randomBytes(32).toString("hex") },
    update: {},
  });
  await db.analyticsSalt.deleteMany({ where: { day: { not: day } } });
  cached = { day, salt: created.salt };
  return created.salt;
}

/** Delete analytics past the retention period stated in the privacy policy. */
export async function purgeOldAnalytics(months = 13) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const [events] = await Promise.all([
    db.analyticsEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    db.analyticsSalt.deleteMany({ where: { day: { not: today() } } }),
  ]);
  return events.count;
}
