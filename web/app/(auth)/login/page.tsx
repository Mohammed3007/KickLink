import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-ink-2">Log in to your KickLink account.</p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-ink-2">
        New to KickLink?{" "}
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
        <p className="font-semibold">Demo accounts</p>
        <p className="mt-1 text-brand-700">
          Player: <span className="font-medium">player@kicklink.app</span>
          <br />
          Organizer: <span className="font-medium">organizer@kicklink.app</span>
          <br />
          Password: <span className="font-medium">password</span>
        </p>
      </div>
    </div>
  );
}
