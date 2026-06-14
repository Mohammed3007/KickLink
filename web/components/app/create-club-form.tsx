"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { createClub, type CreateClubState } from "@/lib/actions/clubs";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Create club
    </Button>
  );
}

export function CreateClubForm() {
  const [state, action] = useActionState<CreateClubState, FormData>(
    createClub,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Field label="Club name" htmlFor="name">
        <Input id="name" name="name" placeholder="Westside Sunday League" required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" placeholder="Ottawa" defaultValue="Ottawa" required />
        </Field>
        <Field label="Home venue" htmlFor="venue">
          <Input id="venue" name="venue" placeholder="Brewer Park" />
        </Field>
      </div>

      <Field label="About" htmlFor="blurb" hint="Tell members what your games are like.">
        <Textarea
          id="blurb"
          name="blurb"
          rows={3}
          placeholder="Friendly but competitive 7-a-side every Sunday. All welcome."
        />
      </Field>

      <Submit />
    </form>
  );
}
