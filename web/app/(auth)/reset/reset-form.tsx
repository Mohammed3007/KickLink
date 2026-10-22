"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth";
import { AuthError, AuthField, AuthStatusCard, GoldButton, GoldButtonLink } from "@/components/auth/auth-ui";
import { rise } from "@/components/auth/rise";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <GoldButton pending={pending} pendingLabel="Updating…">
      Update password
    </GoldButton>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);

  if (state?.ok) {
    return (
      <AuthStatusCard icon={<Check className="size-[26px]" strokeWidth={2.4} />} title="Password updated">
        <p className="mb-5">You&apos;ve been signed out everywhere. Log in with your new password.</p>
        <GoldButtonLink href="/login">Go to login</GoldButtonLink>
      </AuthStatusCard>
    );
  }

  return (
    <form action={action} {...rise(0.18)}>
      <input type="hidden" name="token" value={token} />
      {state?.error && <AuthError>{state.error}</AuthError>}
      <AuthField
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        minLength={8}
      />
      <SubmitButton />
    </form>
  );
}
