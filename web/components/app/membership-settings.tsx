"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveMembershipSettings, createLeague } from "@/lib/actions/memberships";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending}>{children}</Button>;
}

export function MembershipSettings({ org }: { org: { id: string; membershipEnabled: boolean; monthlyMembershipCents: number; yearlyMembershipCents: number; memberWaitlistPriority: boolean } }) {
  const [state, action] = useActionState(saveMembershipSettings, undefined);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="orgId" value={org.id} />
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" name="enabled" defaultChecked={org.membershipEnabled} /> Enable paid club memberships</label>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Monthly membership (CAD)" htmlFor={`monthly-${org.id}`}><Input id={`monthly-${org.id}`} name="monthly" type="number" step="0.01" min="0.50" max="500" defaultValue={org.monthlyMembershipCents / 100} required /></Field>
      <Field label="Yearly membership (CAD)" htmlFor={`yearly-${org.id}`}><Input id={`yearly-${org.id}`} name="yearly" type="number" step="0.01" min="0.50" max="5000" defaultValue={org.yearlyMembershipCents / 100} required /></Field>
    </div>
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" name="priority" defaultChecked={org.memberWaitlistPriority} /> Give active paid members waitlist priority</label>
    <p className="text-sm text-ink-2">One membership covers every league and member-only session in this club. Existing subscribers keep their recurring rate; price changes apply to new subscriptions.</p>
    {state?.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
    {state?.ok && <p role="status" className="text-sm text-ok">Membership settings saved.</p>}
    <Submit>Save memberships</Submit>
  </form>;
}

export function LeagueForm({ orgId }: { orgId: string }) {
  const [state, action] = useActionState(createLeague, undefined);
  return <form action={action} className="space-y-3">
    <input type="hidden" name="orgId" value={orgId} />
    <Field label="League name" htmlFor={`league-${orgId}`}><Input id={`league-${orgId}`} name="name" minLength={3} maxLength={80} required /></Field>
    <Field label="Description" htmlFor={`description-${orgId}`}><Input id={`description-${orgId}`} name="description" maxLength={500} /></Field>
    {state?.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
    {state?.ok && <p role="status" className="text-sm text-ok">League created.</p>}
    <Submit>Create members-only league</Submit>
  </form>;
}
