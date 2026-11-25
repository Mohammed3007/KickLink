import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { hasPaidMembership } from "@/lib/membership-policy";
import { MembershipControls, JoinLeagueButton } from "@/components/app/membership-controls";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGameDate, formatPrice } from "@/lib/utils";

export default async function MembershipPage({ params, searchParams }: {
  params: Promise<{ handle: string }>; searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await requireUser();
  const { handle } = await params;
  const { checkout } = await searchParams;
  const org = await db.organization.findUnique({ where: { handle }, include: {
    memberships: { where: { userId: user.id }, include: { subscription: { include: { invoices: { orderBy: { paidAt: "desc" }, take: 12 } } } } },
    leagues: { include: { enrollments: { where: { userId: user.id } }, _count: { select: { enrollments: true } } }, orderBy: { createdAt: "asc" } },
  } });
  if (!org) notFound();
  const subscription = org.memberships[0]?.subscription;
  const active = org.membershipEnabled && hasPaidMembership(subscription);
  return <div className="mx-auto max-w-2xl pb-12">
    <BackHeader title={`${org.name} membership`} />
    <div className="space-y-5 px-4 pt-4">
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">One club. Every league.</h1><Badge tone={active ? "ok" : "neutral"}>{active ? "Active member" : "Not active"}</Badge></div>
        <p className="text-ink-2">Membership unlocks {org.name}&apos;s leagues and member-only pickup sessions, member prices on open sessions{org.memberWaitlistPriority ? ", and member-first waitlists" : ""}.</p>
        {subscription?.paidThrough && <p className="text-sm">{subscription.cancelAtPeriodEnd ? "Access ends" : active ? "Paid through" : "Last paid through"} {formatGameDate(subscription.paidThrough)}.</p>}
        {org.membershipEnabled ? <MembershipControls orgId={org.id} monthlyCents={org.monthlyMembershipCents} yearlyCents={org.yearlyMembershipCents} active={active} hasSubscription={!!subscription?.stripeSubscriptionId} cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false} checkoutReturned={checkout === "success"} /> : <p>This club is not offering paid memberships yet.</p>}
        <Link className="inline-block text-brand-700 underline" href={`/clubs/${org.handle}`}>View club sessions</Link>
      </Card>
      <h2 className="text-xl font-bold">Leagues</h2>
      {org.leagues.length === 0 && <p className="text-ink-2">No leagues announced yet.</p>}
      {org.leagues.map((league) => <Card key={league.id} className="space-y-3 p-5">
        <h3 className="text-lg font-bold">{league.name}</h3><p className="text-ink-2">{league.description}</p>
        <p className="text-sm text-ink-3">{league._count.enrollments} enrolled · Included with club membership. Game fees may apply.</p>
        <JoinLeagueButton leagueId={league.id} joined={league.enrollments.length > 0} active={active} />
      </Card>)}
      {!!subscription?.invoices.length && <Card className="space-y-3 p-5"><h2 className="text-xl font-bold">Membership payments</h2>{subscription.invoices.map((invoice) => <p key={invoice.id} className="text-sm">{formatGameDate(invoice.paidAt)} · {formatPrice(invoice.amountCents)} CAD · Paid</p>)}</Card>}
    </div>
  </div>;
}
