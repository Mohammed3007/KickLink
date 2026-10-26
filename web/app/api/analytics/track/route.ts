import { NextResponse } from "next/server";
import { endpointRateLimit } from "@/lib/api-rate-limit";
import { readLimitedText } from "@/lib/input";
import { db } from "@/lib/db";
import {
  ANALYTICS_LIMITS,
  analyticsEventSchema,
  clientIpFromHeaders,
  coarseLocation,
  deviceFromUserAgent,
  isBot,
  optedOut,
  referrerHost,
  visitorHash,
} from "@/lib/analytics";
import { dailySalt } from "@/lib/analytics-salt";

export async function POST(req: Request) {
  const limited = await endpointRateLimit({
    scope: "api_analytics_track",
    req,
    maxBodyBytes: ANALYTICS_LIMITS.maxBodyBytes,
  });
  if (limited) return limited;

  const userAgent = req.headers.get("user-agent") ?? "";
  if (optedOut(req.headers) || isBot(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const body = await readLimitedText(req, ANALYTICS_LIMITS.maxBodyBytes);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(body.text);
  } catch {
    return NextResponse.json({ error: "Malformed analytics payload." }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  try {
    const salt = await dailySalt();
    await db.analyticsEvent.create({
      data: {
        type: parsed.data.type,
        name: parsed.data.name,
        path: parsed.data.path,
        referrer: referrerHost(parsed.data.referrer, req.headers.get("host")?.split(":")[0] ?? null),
        title: parsed.data.title,
        metadata: parsed.data.metadata,
        visitorId: visitorHash(salt, clientIpFromHeaders(req.headers), userAgent),
        device: deviceFromUserAgent(userAgent),
        ...coarseLocation(req.headers),
      },
    });
  } catch (error) {
    console.error("Analytics capture failed", error);
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
