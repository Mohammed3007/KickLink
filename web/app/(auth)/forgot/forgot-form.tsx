"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { AuthError, AuthField, AuthStatusCard, GoldButton } from "@/components/auth/auth-ui";
import { rise } from "@/components/auth/rise";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <GoldButton pending={pending} pendingLabel="Sending your link…">
      Send reset link
    </GoldButton>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state?.ok) {
    return (
      <AuthStatusCard icon={<Mail className="size-[26px]" strokeWidth={2} />} title="Check your email">
        If an account exists for that address, a reset link is on its way. It expires in 1 hour.
      </AuthStatusCard>
    );
  }

  return (
    <form action={action} {...rise(0.18)}>
      {state?.error && <AuthError>{state.error}</AuthError>}
      <AuthField id="email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@email.com" required />
      <SubmitButton />
    </form>
  );
}
