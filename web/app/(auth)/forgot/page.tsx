import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
        Reset your password
      </h1>
      <p className="mt-2 text-ink-2">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div className="mt-8">
        <ForgotForm />
      </div>
      <p className="mt-6 text-sm text-ink-2">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
