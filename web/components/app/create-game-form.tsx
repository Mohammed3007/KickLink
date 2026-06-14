"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { createGame, type FormState } from "@/lib/actions/manage";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" full loading={pending}>
      Create game
    </Button>
  );
}

export function CreateGameForm({
  orgs,
}: {
  orgs: { id: string; name: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(createGame, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Field label="Club" htmlFor="orgId">
        <Select id="orgId" name="orgId" required>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" placeholder="Sunday Night 7s" required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Venue" htmlFor="venue">
          <Input id="venue" name="venue" placeholder="Brewer Park Turf" required />
        </Field>
        <Field label="Address" htmlFor="address">
          <Input id="address" name="address" placeholder="170 Hopewell Ave" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date & time" htmlFor="startsAt">
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
        </Field>
        <Field label="Duration (min)" htmlFor="durationMins">
          <Input
            id="durationMins"
            name="durationMins"
            type="number"
            defaultValue={90}
            min={15}
            max={240}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Format" htmlFor="format">
          <Input id="format" name="format" placeholder="7-a-side" defaultValue="7-a-side" required />
        </Field>
        <Field label="Skill level" htmlFor="skill">
          <Input id="skill" name="skill" placeholder="Intermediate" defaultValue="Intermediate" required />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Capacity" htmlFor="capacity">
          <Input id="capacity" name="capacity" type="number" defaultValue={14} min={2} max={60} required />
        </Field>
        <Field label="Price ($)" htmlFor="price">
          <Input id="price" name="price" type="number" step="0.01" defaultValue={12} min={0} required />
        </Field>
        <Field label="Payment" htmlFor="model">
          <Select id="model" name="model" defaultValue="PAY" required>
            <option value="PAY">Pay to join</option>
            <option value="LATER">Pay later</option>
            <option value="FREE">Free</option>
          </Select>
        </Field>
      </div>

      <Submit />
    </form>
  );
}
