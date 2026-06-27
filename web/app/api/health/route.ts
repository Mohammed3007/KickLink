import { NextResponse } from "next/server";
import { endpointRateLimit } from "@/lib/api-rate-limit";

// Diagnostic endpoint — exercises the same queries the app uses and reports
// which step fails. Everything is guarded so it always returns JSON.
export async function GET(req: Request) {
  const limited = await endpointRateLimit({ scope: "api_health", req });
  if (limited) return limited;

  const url = process.env.DATABASE_URL || "";
  const host = url.match(/@([^/?]+)/)?.[1] ?? "(no DATABASE_URL set)";
  const driver = url.includes("neon.tech") ? "neon-serverless" : "pg";
  const result: Record<string, unknown> = {
    host,
    driver,
    hasSecret: !!process.env.AUTH_SECRET,
  };

  const step = async (name: string, fn: () => Promise<unknown>) => {
    try {
      const v = await fn();
      result[name] = typeof v === "number" ? v : "ok";
      return true;
    } catch (e) {
      result[name] = "FAILED";
      result.failedStep = name;
      result.error = e instanceof Error ? e.name : "Unknown";
      result.message = (e instanceof Error ? e.message : String(e)).slice(0, 700);
      return false;
    }
  };

  try {
    const { db } = await import("@/lib/db");
    const { getDashboard, getUnreadCount } = await import("@/lib/queries");

    if (!(await step("count", () => db.user.count())))
      return NextResponse.json(result, { status: 500 });

    const user = await db.user.findFirst({
      where: { email: "player@kicklink.app" },
    });
    if (!user) {
      return NextResponse.json({ ...result, note: "demo user not found" });
    }

    if (!(await step("unread", () => getUnreadCount(user.id))))
      return NextResponse.json(result, { status: 500 });

    if (!(await step("dashboard", () => getDashboard(user.id))))
      return NextResponse.json(result, { status: 500 });

    return NextResponse.json({ ...result, ok: true });
  } catch (e) {
    result.error = e instanceof Error ? e.name : "Unknown";
    result.message = (e instanceof Error ? e.message : String(e)).slice(0, 700);
    result.fatal = true;
    return NextResponse.json(result, { status: 500 });
  }
}
