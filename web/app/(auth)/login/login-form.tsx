"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { authenticate, resendVerification } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Log in
    </Button>
  );
}

export function LoginForm({ returnTo = "/home" }: { returnTo?: string }) {
  const [state, formAction] = useActionState(authenticate, undefined);
  const [resent, setResent] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />

      {state?.error && (
        <div className="space-y-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </div>
          {state.needsVerification && state.email && (
            <button
              type="button"
              onClick={async () => {
                await resendVerification(state.email!);
                setResent(true);
              }}
              className="ml-6 font-semibold underline"
            >
              {resent ? "Verification email sent ✓" : "Resend verification email"}
            </button>
          )}
        </div>
      )}

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot" className="text-sm font-semibold text-brand-700 hover:underline">
          Forgot password?
        </Link>
      </div>

      <SubmitButton />
    </form>
  );
}
