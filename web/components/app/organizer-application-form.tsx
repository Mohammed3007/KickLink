"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { submitOrganizerApplication } from "@/lib/actions/organizer-applications";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Submit application
    </Button>
  );
}

export function OrganizerApplicationForm({ error }: { error?: string }) {
  return (
    <form action={submitOrganizerApplication} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Field label="Working club name" htmlFor="clubName">
        <Input id="clubName" name="clubName" placeholder="Westside Sunday League" required />
      </Field>

      <Field label="City" htmlFor="city">
        <Input id="city" name="city" placeholder="Ottawa" defaultValue="Ottawa" required />
      </Field>

      <Field label="Expected players" htmlFor="expectedPlayers">
        <Input id="expectedPlayers" name="expectedPlayers" type="number" min={4} defaultValue={20} required />
      </Field>

      <Field label="Organizer experience" htmlFor="experience" hint="Tell us where you host, how often, and how you handle safety/no-shows.">
        <Textarea id="experience" name="experience" rows={5} required />
      </Field>

      <Submit />
    </form>
  );
}
