"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Update password
    </Button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-ok-bg p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-ok text-white">
          <CheckCircle2 className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Password updated</h2>
        <p className="mt-1 text-sm text-ink-2">You can now log in with your new password.</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button>Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <div className="rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          {state.error}
        </div>
      )}
      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" required />
      </Field>
      <SubmitButton />
    </form>
  );
}
