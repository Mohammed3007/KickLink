import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { endpointRateLimit } from "@/lib/api-rate-limit";
import { readLimitedText } from "@/lib/input";
import { db } from "@/lib/db";
import {
  ANALYTICS_LIMITS,
  analyticsEventSchema,
  clientIpFromHeaders,
  hashIp,
} from "@/lib/analytics";

export async function POST(req: Request) {
  const limited = await endpointRateLimit({
    scope: "api_analytics_track",
    req,
    maxBodyBytes: ANALYTICS_LIMITS.maxBodyBytes,
  });
  if (limited) return limited;

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

  const session = await auth();
  const ipHash = hashIp(clientIpFromHeaders(req.headers));

  try {
    await db.analyticsEvent.create({
      data: {
        type: parsed.data.type,
        name: parsed.data.name,
        path: parsed.data.path,
        referrer: parsed.data.referrer,
        title: parsed.data.title,
        visitorId: parsed.data.visitorId,
        sessionId: parsed.data.sessionId,
        metadata: parsed.data.metadata,
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300),
        ipHash,
        userId: session?.user?.id ?? null,
      },
    });
  } catch (error) {
    console.error("Analytics capture failed", error);
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
