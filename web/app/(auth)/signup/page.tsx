import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { isGoogleEnabled } from "@/lib/flags";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  const google = isGoogleEnabled();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-ink-2">
        Join a club, find games, and never chase an e-transfer again.
      </p>

      <div className="mt-8">
        {google && (
          <>
            <GoogleButton label="Sign up with Google" />
            <OrDivider />
          </>
        )}
        <SignupForm />
      </div>

      <p className="mt-6 text-sm text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
