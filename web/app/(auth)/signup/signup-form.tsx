"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, MailCheck } from "lucide-react";
import { register, resendVerification } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Create account
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(register, undefined);
  const [resent, setResent] = useState(false);

  // Success → tell them to verify their email.
  if (state?.ok && state.email) {
    return (
      <div className="rounded-2xl bg-brand-50 p-6 text-center ring-1 ring-brand-100">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <MailCheck className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Check your email</h2>
        <p className="mt-1 text-sm text-ink-2">
          We sent a verification link to{" "}
          <span className="font-semibold text-ink">{state.email}</span>. Click it
          to activate your account.
        </p>
        <button
          type="button"
          onClick={async () => {
            await resendVerification(state.email!);
            setResent(true);
          }}
          className="mt-4 text-sm font-semibold text-brand-700 hover:underline"
        >
          {resent ? "Sent again ✓" : "Didn't get it? Resend"}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" placeholder="Daniel Osei" required />
      </Field>

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>

      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" required />
      </Field>

      <SubmitButton />
    </form>
  );
}
