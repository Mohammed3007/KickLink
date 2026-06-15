import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Diagnostic endpoint — reports DB connectivity without leaking the password.
export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const host = url.match(/@([^/?]+)/)?.[1] ?? "(no DATABASE_URL set)";
  const hasSecret = !!process.env.AUTH_SECRET;

  try {
    const users = await db.user.count();
    return NextResponse.json({ ok: true, host, hasSecret, users });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        host,
        hasSecret,
        error: e instanceof Error ? e.name : "Unknown",
        message: (e instanceof Error ? e.message : String(e)).slice(0, 600),
      },
      { status: 500 }
    );
  }
}
