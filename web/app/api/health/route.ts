import { NextResponse } from "next/server";
import { endpointRateLimit } from "@/lib/api-rate-limit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public liveness/readiness probe for uptime monitors. Reports only whether
// the app can reach its database; failure details go to the server log.
export async function GET(req: Request) {
  const limited = await endpointRateLimit({ scope: "api_health", req });
  if (limited) return limited;

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, db: "ok" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Health check: database unreachable", error);
    return NextResponse.json(
      { ok: false, db: "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
