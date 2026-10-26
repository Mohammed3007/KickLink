import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sendOfferEmails, sweepAllHolds } from "@/lib/waitlist";
import { processDueRefunds } from "@/lib/refunds";
import { purgeOldAnalytics } from "@/lib/analytics-salt";
import { purgeStaleRateLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Scheduled maintenance: release lapsed waitlist offers and checkout holds
 * (offering the spots on), send any spot-offer emails that haven't gone out,
 * retry refunds owed for payments that arrived after their spot was gone,
 * delete analytics older than the 13 months the privacy policy allows, and
 * delete idle rate-limit records (keyed on IP addresses and emails). Vercel Cron and the GitHub Actions schedule both
 * call this with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holds = await sweepAllHolds();
  const offerEmails = await sendOfferEmails();
  const refunds = await processDueRefunds();
  const analyticsPurged = await purgeOldAnalytics();
  const rateLimitsPurged = await purgeStaleRateLimits();
  return NextResponse.json({ ok: true, holds, offerEmails, refunds, analyticsPurged, rateLimitsPurged });
}
