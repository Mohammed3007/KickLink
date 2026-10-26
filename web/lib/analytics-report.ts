import { db } from "@/lib/db";
import { APP_TIME_ZONE } from "@/lib/utils";

export const REPORT_RANGES = [7, 30, 90] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export type Ranked = { label: string; count: number };
export type DayPoint = { day: string; views: number; visitors: number };

/** Database IDs in paths (/games/cmh…) group as one page. */
const ID_SEGMENT = "/c[a-z0-9]{20,}";

export function localDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(date);
}

function toNumber(value: bigint | number | null) {
  return Number(value ?? 0);
}

/**
 * Traffic and product numbers for the admin dashboard. Visitors are counted
 * per day (visitor hashes change daily), so "visitors" over a range is the
 * sum of daily unique visitors.
 */
export async function analyticsReport(days: ReportRange) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const tz = APP_TIME_ZONE;

  const [daily, topPages, referrers, events, devices, places, funnel] = await Promise.all([
    db.$queryRaw<{ day: string; views: bigint; visitors: bigint }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD') AS day,
             count(*) AS views,
             count(DISTINCT "visitorId") AS visitors
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    db.$queryRaw<{ label: string; count: bigint }[]>`
      SELECT regexp_replace(split_part(path, '?', 1), ${ID_SEGMENT}, '/[id]', 'g') AS label,
             count(*) AS count
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    db.$queryRaw<{ label: string; count: bigint }[]>`
      SELECT referrer AS label, count(DISTINCT (to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD'), "visitorId")) AS count
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND referrer <> '' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    db.$queryRaw<{ label: string; count: bigint }[]>`
      SELECT name AS label, count(*) AS count
      FROM "AnalyticsEvent"
      WHERE type = 'USER_EVENT' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
    db.$queryRaw<{ label: string; count: bigint }[]>`
      SELECT device AS label, count(DISTINCT (to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD'), "visitorId")) AS count
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND device <> '' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC`,
    db.$queryRaw<{ label: string; count: bigint }[]>`
      SELECT concat_ws(', ', NULLIF(region, ''), country) AS label,
             count(DISTINCT (to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD'), "visitorId")) AS count
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND country <> '' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    db.$queryRaw<{ landing: bigint; signup: bigint }[]>`
      SELECT count(DISTINCT (to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD'), "visitorId")) FILTER (WHERE path = '/' OR path LIKE '/?%') AS landing,
             count(DISTINCT (to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD'), "visitorId")) FILTER (WHERE path = '/signup' OR path LIKE '/signup?%') AS signup
      FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${since}`,
  ]);

  const [newUsers, newClubs, gamesCreated, registrations, revenue, pendingApplications] = await Promise.all([
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.organization.count({ where: { createdAt: { gte: since } } }),
    db.game.count({ where: { createdAt: { gte: since } } }),
    db.registration.count({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } } }),
    db.payment.aggregate({
      where: { createdAt: { gte: since }, status: "SUCCEEDED", refundDue: false },
      _sum: { amountCents: true },
    }),
    db.organizerApplication.count({ where: { status: "PENDING" } }),
  ]);

  // One point per day, including days with no traffic.
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = localDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const row = byDay.get(day);
    series.push({ day, views: toNumber(row?.views ?? 0), visitors: toNumber(row?.visitors ?? 0) });
  }

  const ranked = (rows: { label: string; count: bigint }[]): Ranked[] =>
    rows.map((r) => ({ label: r.label, count: toNumber(r.count) }));

  return {
    series,
    totals: {
      views: series.reduce((sum, d) => sum + d.views, 0),
      visitors: series.reduce((sum, d) => sum + d.visitors, 0),
    },
    topPages: ranked(topPages),
    referrers: ranked(referrers),
    events: ranked(events),
    devices: ranked(devices),
    places: ranked(places),
    funnel: {
      landing: toNumber(funnel[0]?.landing ?? 0),
      signup: toNumber(funnel[0]?.signup ?? 0),
      accounts: newUsers,
    },
    product: {
      newUsers,
      newClubs,
      gamesCreated,
      registrations,
      revenueCents: revenue._sum.amountCents ?? 0,
      pendingApplications,
    },
  };
}
