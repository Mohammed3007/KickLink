import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Set new password" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ink">Invalid link</h1>
        <p className="mt-2 text-ink-2">
          This reset link is missing its token.{" "}
          <Link href="/forgot" className="font-semibold text-brand-700 hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
        Set a new password
      </h1>
      <p className="mt-2 text-ink-2">Choose a strong password you&apos;ll remember.</p>
      <div className="mt-8">
        <ResetForm token={token} />
      </div>
    </div>
  );
}
