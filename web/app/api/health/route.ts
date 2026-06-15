import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDashboard, getUnreadCount } from "@/lib/queries";

// Diagnostic endpoint — exercises the same queries the app uses, reports
// which step fails (no password leaked).
export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const host = url.match(/@([^/?]+)/)?.[1] ?? "(no DATABASE_URL set)";
  const result: Record<string, unknown> = { host, hasSecret: !!process.env.AUTH_SECRET };

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

  if (!(await step("count", () => db.user.count())))
    return NextResponse.json(result, { status: 500 });

  const user = await db.user.findFirst({ where: { email: "player@kicklink.app" } });
  if (!user) {
    result.note = "demo user not found";
    return NextResponse.json(result);
  }
  result.userId = "found";

  if (!(await step("unread", () => getUnreadCount(user.id))))
    return NextResponse.json(result, { status: 500 });

  if (!(await step("dashboard", () => getDashboard(user.id))))
    return NextResponse.json(result, { status: 500 });

  return NextResponse.json({ ...result, ok: true });
}
