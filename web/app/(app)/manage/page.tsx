import Link from "next/link";
import { Plus, Users, Wallet, CalendarDays, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateChip } from "@/components/app/date-chip";
import { ConnectPayments } from "@/components/app/connect-payments";
import { isStripeEnabled } from "@/lib/flags";
import { refreshConnectStatus } from "@/lib/actions/payments";
import { formatPrice, formatGameDate, formatTime } from "@/lib/utils";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"];

function oneHourAgo() {
  return new Date(Date.now() - 3600_000);
}

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string }>;
}) {
  const user = await requireUser();
  const { connect } = await searchParams;
  const stripeEnabled = isStripeEnabled();
  const upcomingCutoff = oneHourAgo();

  // Returning from Stripe onboarding — refresh this club's payout status.
  if (connect && stripeEnabled) {
    await refreshConnectStatus(connect);
  }

  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    include: {
      _count: { select: { memberships: true } },
      games: {
        where: { startsAt: { gte: upcomingCutoff } },
        include: {
          registrations: { select: { status: true, payStatus: true } },
        },
        orderBy: { startsAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  if (orgs.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-8">
        <PageHeader title="Organize" />
        <div className="mt-6 rounded-2xl border border-dashed border-line py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Users className="size-6" />
          </span>
          <p className="mt-4 font-semibold text-ink">
            Run your own pickup games
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-2">
            Create a club, invite your crew with a code, and start collecting
            payments in minutes.
          </p>
          <Link href="/manage/clubs/new" className="mt-5 inline-block">
            <Button size="lg">
              <Plus className="size-4" /> Create a club
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <PageHeader
        title="Organize"
        subtitle="Manage your clubs, games and rosters."
        action={
          <div className="flex gap-2">
            <Link href="/manage/clubs/new">
              <Button variant="secondary">New club</Button>
            </Link>
            <Link href="/manage/games/new">
              <Button>
                <Plus className="size-4" /> New game
              </Button>
            </Link>
          </div>
        }
      />

      {orgs.map((org) => {
        const revenueCents = org.games.reduce(
          (sum, g) =>
            sum +
            g.registrations.filter((r) => r.payStatus === "PAID").length *
              g.priceCents,
          0
        );
        return (
          <section key={org.id} className="mt-8">
            <div className="flex items-center gap-3">
              <Avatar name={org.name} color={org.color} size={40} />
              <div className="flex-1">
                <h2 className="font-bold text-ink">{org.name}</h2>
                <p className="text-sm text-ink-3">
                  {org._count.memberships} members · {org.games.length} upcoming
                </p>
              </div>
              <Link
                href={`/clubs/${org.handle}`}
                className="text-sm font-semibold text-brand-700"
              >
                View club
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <Stat icon={<Users className="size-4" />} label="Members" value={String(org._count.memberships)} />
              <Stat icon={<CalendarDays className="size-4" />} label="Games" value={String(org.games.length)} />
              <Stat icon={<Wallet className="size-4" />} label="Collected" value={formatPrice(revenueCents)} />
            </div>

            <div className="mt-3">
              <ConnectPayments
                orgId={org.id}
                chargesEnabled={org.chargesEnabled}
                stripeEnabled={stripeEnabled}
              />
            </div>

            <div className="mt-3 space-y-2.5">
              {org.games.length === 0 && (
                <Card className="p-5 text-center text-sm text-ink-2">
                  No upcoming games.{" "}
                  <Link href="/manage/games/new" className="font-semibold text-brand-700">
                    Create one
                  </Link>
                </Card>
              )}
              {org.games.map((g) => {
                const taken = g.registrations.filter((r) =>
                  OCCUPYING.includes(r.status)
                ).length;
                const unpaid = g.registrations.filter(
                  (r) => r.status === "PROVISIONAL"
                ).length;
                return (
                  <Link key={g.id} href={`/manage/games/${g.id}`}>
                    <Card className="flex items-center gap-3.5 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-pop">
                      <DateChip date={g.startsAt} color={org.color} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{g.title}</p>
                        <p className="text-sm text-ink-3">
                          {formatGameDate(g.startsAt)} · {formatTime(g.startsAt)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge tone={taken >= g.capacity ? "info" : "neutral"}>
                            {taken}/{g.capacity} in
                          </Badge>
                          {unpaid > 0 && (
                            <Badge tone="warn" dot>
                              {unpaid} unpaid
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="size-5 shrink-0 text-ink-3" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </Card>
  );
}
