"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { register, resendVerification } from "@/lib/actions/auth";
import { AuthError, AuthField, GoldButton } from "@/components/auth/auth-ui";
import { rise } from "@/components/auth/rise";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <GoldButton pending={pending} pendingLabel="Creating your account…">
      Create account
    </GoldButton>
  );
}

/** "Check your email" card shown in place of the form after signing up. */
function SentCard({ email, onBack }: { email: string; onBack: () => void }) {
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!resent) return;
    const timer = window.setTimeout(() => setResent(false), 2200);
    return () => window.clearTimeout(timer);
  }, [resent]);

  return (
    <div
      role="status"
      className="animate-pop rounded-[18px] border-[1.5px] border-[rgba(231,185,90,0.2)] bg-[#141418] px-[26px] py-[30px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
    >
      <div className="relative mx-auto mb-[18px] size-[58px]">
        <span className="absolute inset-0 rounded-full bg-[rgba(231,185,90,0.35)]" />
        <span className="relative flex size-[58px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4d78b,#c9952f)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A1304" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="M4 7l8 6 8-6" />
          </svg>
        </span>
      </div>
      <h2 className="mb-2 text-[22px] font-bold text-[#f7f5f0]">Check your email</h2>
      <p className="mb-[18px] text-[14.5px] leading-[1.55] text-[#928d82]">
        We sent a verification link to <strong className="text-brand-600">{email}</strong>. Click
        it to activate your account and pick your club.
      </p>
      <div className="flex items-center justify-center gap-[18px]">
        <button
          type="button"
          onClick={async () => {
            await resendVerification(email);
            setResent(true);
          }}
          className="p-1.5 text-sm font-bold text-brand-600 hover:text-brand-800"
        >
          {resent ? "Link sent ✓" : "Resend link"}
        </button>
        <span className="h-3.5 w-px bg-white/14" />
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 text-sm font-semibold text-[#7e796e] hover:text-ink-2"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

export function SignupForm({ delay = 0.38 }: { delay?: number }) {
  const [state, formAction] = useActionState(register, undefined);
  // "Use a different email" hides this result's card; a new signup shows the next one.
  const [dismissed, setDismissed] = useState<typeof state>(undefined);

  if (state?.ok && state.email && state !== dismissed) {
    return <SentCard email={state.email} onBack={() => setDismissed(state)} />;
  }

  return (
    <form action={formAction} {...rise(delay)}>
      {state?.error && <AuthError>{state.error}</AuthError>}

      <AuthField id="name" name="name" label="Full name" autoComplete="name" placeholder="Daniel Osei" required minLength={2} />
      <AuthField id="email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@email.com" required />
      <AuthField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        minLength={8}
      />

      <SubmitButton />
      <p className="mt-3.5 text-center text-xs leading-relaxed text-[#7e796e]">
        By creating an account you agree to the{" "}
        <Link href="/terms" className="font-semibold text-[#b6b0a4] hover:text-brand-600">Terms</Link> and{" "}
        <Link href="/privacy" className="font-semibold text-[#b6b0a4] hover:text-brand-600">Privacy policy</Link>.
      </p>
    </form>
  );
}
