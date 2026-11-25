import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { hasPaidMembership } from "@/lib/membership-policy";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { MembershipSettings, LeagueForm } from "@/components/app/membership-settings";
import { Card } from "@/components/ui/card";
import { formatGameDate, formatPrice } from "@/lib/utils";

export default async function ManageMembershipsPage() {
  const user = await requireUser();
  const orgs = await db.organization.findMany({ where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } }, include: {
    memberships: { where: { subscription: { isNot: null } }, include: { user: { select: { name: true, email: true } }, subscription: { include: { invoices: true } } } },
    leagues: { include: { _count: { select: { enrollments: true } } } },
  } });
  return <OrganizerPageShell title="Memberships & leagues" subtitle="Set recurring club fees, member benefits, and leagues." active="/manage/memberships">
    {orgs.length === 0 && <p>You need organizer access to manage club memberships.</p>}
    <div className="space-y-6">{orgs.map((org) => <Card key={org.id} className="space-y-6 p-5">
      <h2 className="text-2xl font-bold">{org.name}</h2>
      {!org.chargesEnabled && <p className="text-sm text-warn">Connect Stripe from Finances before accepting real memberships.</p>}
      <MembershipSettings org={org} />
      <Link href={`/clubs/${org.handle}/membership`} className="inline-block text-brand-700 underline">View player membership page</Link>
      <h3 className="text-lg font-bold">Leagues</h3>
      {org.leagues.map((league) => <p key={league.id}>{league.name} · {league._count.enrollments} enrolled</p>)}
      {org.membershipEnabled && <LeagueForm orgId={org.id} />}
      <h3 className="text-lg font-bold">Subscribers</h3>
      <p className="text-sm text-ink-2">{org.memberships.filter((member) => hasPaidMembership(member.subscription)).length} active · {formatPrice(org.memberships.reduce((sum, member) => sum + (member.subscription?.invoices.reduce((total, invoice) => total + invoice.amountCents, 0) ?? 0), 0))} CAD in membership payments received</p>
      {org.memberships.length === 0 && <p className="text-sm text-ink-2">No subscriptions yet.</p>}
      {org.memberships.map((member) => <div key={member.id} className="border-t border-line pt-3 text-sm">
        <p className="font-semibold">{member.user.name} · {member.user.email}</p>
        <p>{hasPaidMembership(member.subscription) ? "Active" : "Not active"} · {member.subscription?.plan.toLowerCase()} · {member.subscription?.cancelAtPeriodEnd ? "Renewal cancelled" : member.subscription?.status}</p>
        {member.subscription?.paidThrough && <p>Paid through {formatGameDate(member.subscription.paidThrough)}</p>}
      </div>)}
    </Card>)}</div>
  </OrganizerPageShell>;
}
