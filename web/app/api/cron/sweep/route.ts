import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sendOfferEmails, sweepAllHolds } from "@/lib/waitlist";
import { processDueRefunds } from "@/lib/refunds";

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
 * and retry refunds owed for payments that arrived after their spot was gone. Vercel Cron and the GitHub Actions schedule both
 * call this with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holds = await sweepAllHolds();
  const offerEmails = await sendOfferEmails();
  const refunds = await processDueRefunds();
  return NextResponse.json({ ok: true, holds, offerEmails, refunds });
}
