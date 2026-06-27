"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Repeat2 } from "lucide-react";
import { createGame, type FormState } from "@/lib/actions/manage";
import { Input, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SPORT_OPTIONS } from "@/lib/sports";

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
  orgs: { id: string; name: string; sport?: string }[];
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
        <Input id="title" name="title" placeholder="Sunday Night pickup" required />
      </Field>

      <Field label="Sport" htmlFor="sport" hint="Use any sport. Players can filter games by this value.">
        <Input id="sport" name="sport" list="game-sports" defaultValue={orgs[0]?.sport ?? "Football"} required />
        <datalist id="game-sports">
          {SPORT_OPTIONS.map((sport) => (
            <option key={sport} value={sport} />
          ))}
        </datalist>
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
          <Input id="format" name="format" placeholder="5v5, doubles, open run" defaultValue="Pickup" required />
        </Field>
        <Field label="Skill level" htmlFor="skill">
          <Input id="skill" name="skill" placeholder="Intermediate" defaultValue="Intermediate" required />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Capacity" htmlFor="capacity">
          <Input id="capacity" name="capacity" type="number" defaultValue={14} min={2} max={1000} required />
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

      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Repeat2 className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-ink">Recurring pickup</p>
            <p className="text-xs text-ink-3">
              Generate weekly game occurrences from this setup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Repeat" htmlFor="recurrenceMode">
            <Select id="recurrenceMode" name="recurrenceMode" defaultValue="SINGLE" required>
              <option value="SINGLE">One game</option>
              <option value="WEEKLY">Weekly series</option>
            </Select>
          </Field>
          <Field label="Occurrences" htmlFor="occurrenceCount" hint="Used for weekly series.">
            <Input
              id="occurrenceCount"
              name="occurrenceCount"
              type="number"
              defaultValue={6}
              min={2}
              max={26}
              required
            />
          </Field>
        </div>

        <div className="mt-3">
          <Field
            label="Series billing"
            htmlFor="seriesPaymentMode"
            hint="Per-game charging is active now. Upfront and weekly recurring are stored for the series; checkout enforcement is next."
          >
            <Select id="seriesPaymentMode" name="seriesPaymentMode" defaultValue="PER_GAME" required>
              <option value="PER_GAME">Charge each game separately</option>
              <option value="UPFRONT">Upfront series pass</option>
              <option value="WEEKLY_RECURRING">Weekly recurring billing</option>
            </Select>
          </Field>
        </div>
      </div>

      <Submit />
    </form>
  );
}
