"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Megaphone } from "lucide-react";
import { postAnnouncement, type FormState } from "@/lib/actions/manage";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      full
      loading={pending}
      className="bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-none hover:brightness-105"
    >
      <Megaphone className="size-4" />
      Send announcement
    </Button>
  );
}

export function AnnouncementForm({
  orgs,
}: {
  orgs: Array<{ id: string; name: string }>;
}) {
  const [state, action] = useActionState<FormState, FormData>(postAnnouncement, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Field label="Club" htmlFor="orgId">
        <select
          id="orgId"
          name="orgId"
          required
          className="h-11 w-full rounded-2xl border border-line bg-surface px-4 text-[15px] font-medium text-ink outline-none transition-colors focus:border-brand-300"
        >
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title" htmlFor="title" hint="Short enough to read as an alert.">
        <Input
          id="title"
          name="title"
          placeholder="Thursday game moved indoors"
          maxLength={100}
          required
        />
      </Field>

      <Field label="Message" htmlFor="body" hint="Members will see this on the club page and in Alerts.">
        <Textarea
          id="body"
          name="body"
          rows={7}
          placeholder="Field changed to Glebe Dome. Please arrive 10 minutes early and bring a dark shirt."
          maxLength={1000}
          required
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
