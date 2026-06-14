"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Send reset link
    </Button>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-brand-50 p-6 text-center ring-1 ring-brand-100">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <MailCheck className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Check your email</h2>
        <p className="mt-1 text-sm text-ink-2">
          If an account exists for that address, a reset link is on its way.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          {state.error}
        </div>
      )}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <SubmitButton />
    </form>
  );
}
