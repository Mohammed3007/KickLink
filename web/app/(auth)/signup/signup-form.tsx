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
    <div role="status" className="status">
      <span className="check">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      </span>
      <h2>Check your email</h2>
      <p className="body">
        We sent a verification link to <strong className="hl">{email}</strong>. Click it to activate your
        account and pick your club.
      </p>
      <div className="status-actions">
        <button
          type="button"
          onClick={async () => {
            await resendVerification(email);
            setResent(true);
          }}
        >
          {resent ? "Link sent ✓" : "Resend link"}
        </button>
        <button type="button" onClick={onBack}>
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
      <p className="fine-print">
        By creating an account you agree to the <Link href="/terms">Terms</Link> and{" "}
        <Link href="/privacy">Privacy policy</Link>.
      </p>
    </form>
  );
}
