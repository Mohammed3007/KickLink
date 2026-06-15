"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-5">
      <Card className="max-w-lg p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
          Something needs attention
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">KickLink could not load this page</h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">
          Try again. If this is production, check `/api/health` and confirm the Vercel environment
          variables and database migrations are applied.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            className="rounded-2xl bg-ink px-4 py-2 text-sm font-bold text-white"
            onClick={reset}
            type="button"
          >
            Reload
          </button>
          <Link className="rounded-2xl bg-surface-2 px-4 py-2 text-sm font-bold text-ink" href="/api/health">
            Health check
          </Link>
        </div>
      </Card>
    </main>
  );
}
