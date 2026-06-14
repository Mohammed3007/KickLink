"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Plus, AlertCircle } from "lucide-react";
import { joinClub } from "@/lib/actions/clubs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Join
    </Button>
  );
}

export function JoinClubForm() {
  const router = useRouter();
  const [state, action] = useActionState(joinClub, undefined);

  useEffect(() => {
    if (state?.ok && state.handle) router.push(`/clubs/${state.handle}`);
  }, [state, router]);

  return (
    <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
      <div className="flex items-center gap-2 text-brand-800">
        <Plus className="size-5" />
        <p className="font-semibold">Join a club</p>
      </div>
      <p className="mt-1 text-sm text-brand-700">
        Have an invite code from your organizer? Enter it to join.
      </p>
      <form action={action} className="mt-3 flex gap-2">
        <Input
          name="code"
          placeholder="e.g. WESTSIDE"
          className="bg-surface uppercase"
          autoCapitalize="characters"
          required
        />
        <Submit />
      </form>
      {state?.error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-bad">
          <AlertCircle className="size-4" />
          {state.error}
        </p>
      )}
    </div>
  );
}
