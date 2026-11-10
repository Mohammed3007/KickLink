"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { authenticate, resendVerification } from "@/lib/actions/auth";
import { AuthError, AuthField, GoldButton } from "@/components/auth/auth-ui";
import { rise } from "@/components/auth/rise";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <GoldButton pending={pending} pendingLabel="Logging in…">
      Log in
    </GoldButton>
  );
}

export function LoginForm({ returnTo = "/home", delay = 0.3 }: { returnTo?: string; delay?: number }) {
  const [state, formAction] = useActionState(authenticate, undefined);
  const [resent, setResent] = useState(false);

  return (
    <form action={formAction} {...rise(delay)}>
      <input type="hidden" name="returnTo" value={returnTo} />

      {state?.error && (
        <AuthError>
          {state.error}
          {state.needsVerification && state.email && (
            <button
              type="button"
              onClick={async () => {
                await resendVerification(state.email!);
                setResent(true);
              }}
            >
              {resent ? "Verification email sent ✓" : "Resend verification email"}
            </button>
          )}
        </AuthError>
      )}

      <AuthField id="email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@email.com" required />
      <AuthField id="password" name="password" type="password" label="Password" autoComplete="current-password" placeholder="Your password" required />

      <div className="row-end">
        <Link href="/forgot">Forgot password?</Link>
      </div>

      <SubmitButton />
    </form>
  );
}
