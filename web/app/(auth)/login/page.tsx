import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { isGoogleEnabled } from "@/lib/flags";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  const google = isGoogleEnabled();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-ink-2">Log in to your KickLink account.</p>

      <div className="mt-8">
        {google && (
          <>
            <GoogleButton />
            <OrDivider />
          </>
        )}
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-ink-2">
        New to KickLink?{" "}
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
