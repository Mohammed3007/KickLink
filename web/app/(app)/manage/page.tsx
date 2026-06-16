import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Megaphone,
  Plus,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
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
      recurringSeries: {
        where: { archivedAt: null },
        orderBy: { startsAt: "asc" },
        take: 6,
      },
    },
    orderBy: { name: "asc" },
  });

  if (orgs.length === 0) {
    return <OrganizerEmptyState organizerApproved={user.organizerApproved} />;
  }

  const totals = orgs.reduce(
    (acc, org) => {
      const paidCents = org.games.reduce(
        (sum, game) =>
          sum +
          game.registrations.filter((registration) => registration.payStatus === "PAID").length *
            game.priceCents,
        0
      );
      const unpaid = org.games.reduce(
        (sum, game) =>
          sum + game.registrations.filter((registration) => registration.status === "PROVISIONAL").length,
        0
      );
      return {
        clubs: acc.clubs + 1,
        games: acc.games + org.games.length,
        members: acc.members + org._count.memberships,
        paidCents: acc.paidCents + paidCents,
        unpaid: acc.unpaid + unpaid,
        paymentReady: acc.paymentReady + (org.chargesEnabled ? 1 : 0),
      };
    },
    { clubs: 0, games: 0, members: 0, paidCents: 0, unpaid: 0, paymentReady: 0 }
  );

  const nextGame = orgs
    .flatMap((org) => org.games.map((game) => ({ ...game, org })))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="bg-landing-field relative overflow-hidden rounded-[1.75rem] px-5 py-6 text-white shadow-[0_26px_70px_-42px_rgba(8,10,9,.9)] sm:px-7">
        <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">
              <Sparkles className="size-3.5" />
              Organizer workspace
            </div>
            <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-[-0.035em] text-[#f4efe3] sm:text-5xl">
              Run the week without opening the group chat.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c8c4b7] sm:text-base">
              Create games, keep rosters clean, check payment readiness and jump straight into the
              organizer tasks that need attention.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/manage/games/new">
                <Button className="bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-none hover:brightness-105">
                  <Plus className="size-4" /> New game
                </Button>
              </Link>
              <Link href="/manage/clubs/new">
                <Button
                  variant="secondary"
                  className="border border-white/10 bg-white/8 text-white ring-0 hover:bg-white/14"
                >
                  New club
                </Button>
              </Link>
              <Link href="/manage/finances">
                <Button
                  variant="secondary"
                  className="border border-white/10 bg-white/8 text-white ring-0 hover:bg-white/14"
                >
                  Finances
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HeroStat label="Clubs" value={String(totals.clubs)} icon={<ShieldCheck className="size-4" />} />
            <HeroStat label="Upcoming" value={String(totals.games)} icon={<CalendarDays className="size-4" />} />
            <HeroStat label="Members" value={String(totals.members)} icon={<Users className="size-4" />} />
            <HeroStat label="Collected" value={formatPrice(totals.paidCents)} icon={<Wallet className="size-4" />} />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">Today&apos;s tools</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.02em] text-ink">What do you need to do?</h2>
          </div>
          <div className="grid divide-y divide-line">
            <ToolLink
              href="/manage/games/new"
              icon={<CalendarDays className="size-5" />}
              title="Create a game"
              body="Post one-off or weekly pickup games with capacity, venue and payment model."
            />
            <ToolLink
              href="/manage/finances"
              icon={<CreditCard className="size-5" />}
              title="Check payment setup"
              body={`${totals.paymentReady}/${totals.clubs} clubs ready to charge players through Stripe Connect.`}
            />
            <ToolLink
              href={nextGame ? `/manage/games/${nextGame.id}` : "/manage/games"}
              icon={<Users className="size-5" />}
              title="Manage a roster"
              body={
                nextGame
                  ? `Next up: ${nextGame.title} at ${formatTime(nextGame.startsAt)}.`
                  : "Create your next game to start building a roster."
              }
            />
            <ToolLink
              href="/manage/members"
              icon={<ShieldCheck className="size-5" />}
              title="Members and invites"
              body="See who belongs to each club and share the invite code testers need."
            />
            <ToolLink
              href="/manage/announcements"
              icon={<Megaphone className="size-5" />}
              title="Announcements"
              body="Send field changes, reminders and club updates to members."
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">Attention</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.02em] text-ink">Organizer readiness</h2>
            </div>
            {totals.unpaid > 0 ? (
              <Badge tone="warn" dot>
                {totals.unpaid} provisional
              </Badge>
            ) : (
              <Badge tone="ok" dot>
                Rosters clean
              </Badge>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ReadinessCard
              title="Payments"
              value={`${totals.paymentReady}/${totals.clubs}`}
              body="Connected clubs"
              good={totals.paymentReady === totals.clubs}
            />
            <ReadinessCard
              title="Rosters"
              value={String(totals.unpaid)}
              body="Provisional spots"
              good={totals.unpaid === 0}
            />
            <ReadinessCard
              title="Schedule"
              value={String(totals.games)}
              body="Upcoming games"
              good={totals.games > 0}
            />
          </div>

          {nextGame && (
            <Link href={`/manage/games/${nextGame.id}`} className="mt-5 block">
              <div className="rounded-2xl border border-line bg-surface-2/70 p-4 transition-colors hover:bg-surface-2">
                <div className="flex items-center gap-3">
                  <DateChip date={nextGame.startsAt} color={nextGame.org.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-ink">{nextGame.title}</p>
                    <p className="text-sm text-ink-3">
                      {nextGame.org.name} · {formatGameDate(nextGame.startsAt)} · {formatTime(nextGame.startsAt)}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-ink-3" />
                </div>
              </div>
            </Link>
          )}
        </Card>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">Your clubs</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-ink">Club command centers</h2>
          </div>
          <Link href="/manage/finances" className="text-sm font-bold text-brand-700">
            View finances
          </Link>
        </div>

        <div className="mt-4 grid gap-5">
          {orgs.map((org) => (
            <ClubPanel key={org.id} org={org} stripeEnabled={stripeEnabled} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrganizerEmptyState({ organizerApproved }: { organizerApproved: boolean }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="bg-landing-field relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center text-white">
        <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/10 text-gold-300">
            <Users className="size-7" />
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] text-[#f4efe3] sm:text-4xl">
            Build your first KickLink club
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c8c4b7]">
            {organizerApproved
              ? "Create a club, invite your regulars and start posting games with proper rosters and payment tracking."
              : "Apply to organize first. Once approved, you can create clubs, post games and connect payments."}
          </p>
          <Link href={organizerApproved ? "/manage/clubs/new" : "/manage/apply"} className="mt-6 inline-block">
            <Button
              size="lg"
              className="bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-none hover:brightness-105"
            >
              <Plus className="size-4" /> {organizerApproved ? "Create a club" : "Apply to organize"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ClubPanel({
  org,
  stripeEnabled,
}: {
  org: Awaited<ReturnType<typeof db.organization.findMany>>[number] & {
    games: Array<{
      id: string;
      title: string;
      startsAt: Date;
      capacity: number;
      priceCents: number;
      registrations: Array<{ status: string; payStatus: string }>;
    }>;
    recurringSeries: Array<{
      id: string;
      title: string;
      startsAt: Date;
      occurrenceCount: number;
      paymentMode: string;
      priceCents: number;
      capacity: number;
      venue: string;
    }>;
    _count: { memberships: number };
  };
  stripeEnabled: boolean;
}) {
  const revenueCents = org.games.reduce(
    (sum, game) =>
      sum +
      game.registrations.filter((registration) => registration.payStatus === "PAID").length * game.priceCents,
    0
  );
  const nextTwoGames = org.games.slice(0, 2);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[18rem_1fr]">
        <div className="bg-field-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <Avatar name={org.name} color={org.color} size={44} />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-[#f4efe3]">{org.name}</h3>
              <p className="text-sm text-white/45">{org._count.memberships} members</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <MiniMetric label="Games" value={String(org.games.length)} />
            <MiniMetric label="Collected" value={formatPrice(revenueCents)} />
          </div>

          <div className="mt-5">
            <ConnectPayments
              orgId={org.id}
              chargesEnabled={org.chargesEnabled}
              stripeEnabled={stripeEnabled}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/clubs/${org.handle}`}>
              <Button
                size="sm"
                variant="secondary"
                className="border border-white/10 bg-white/8 text-white ring-0 hover:bg-white/14"
              >
                View club
              </Button>
            </Link>
            <Link href="/manage/games/new">
              <Button size="sm" className="bg-gold-400 text-field-950 shadow-none hover:bg-gold-300">
                New game
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-black text-ink">Upcoming games</h4>
                <Badge tone={org.games.length > 0 ? "ok" : "neutral"}>
                  {org.games.length} scheduled
                </Badge>
              </div>
              <div className="mt-3 space-y-2.5">
                {nextTwoGames.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2">
                    No upcoming games yet.{" "}
                    <Link href="/manage/games/new" className="font-bold text-brand-700">
                      Create one
                    </Link>
                  </div>
                )}
                {nextTwoGames.map((game) => (
                  <GameRow key={game.id} game={game} color={org.color} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-black text-ink">Recurring pickup</h4>
                <Badge tone={org.recurringSeries.length > 0 ? "info" : "neutral"}>
                  {org.recurringSeries.length} series
                </Badge>
              </div>
              <div className="mt-3 space-y-2.5">
                {org.recurringSeries.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2">
                    Weekly game templates will live here once created from the game form.
                  </div>
                )}
                {org.recurringSeries.slice(0, 2).map((series) => (
                  <div key={series.id} className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <Repeat2 className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{series.title}</p>
                        <p className="mt-0.5 text-sm text-ink-3">
                          {series.occurrenceCount} weeks · starts {formatGameDate(series.startsAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge tone="info">{seriesPaymentLabel(series.paymentMode)}</Badge>
                          <Badge tone="neutral">{formatPrice(series.priceCents)}</Badge>
                          <Badge tone="neutral">{series.capacity} spots</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function GameRow({
  game,
  color,
}: {
  game: {
    id: string;
    title: string;
    startsAt: Date;
    capacity: number;
    registrations: Array<{ status: string; payStatus: string }>;
  };
  color: string;
}) {
  const taken = game.registrations.filter((registration) => OCCUPYING.includes(registration.status)).length;
  const unpaid = game.registrations.filter((registration) => registration.status === "PROVISIONAL").length;
  return (
    <Link href={`/manage/games/${game.id}`} className="block">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5 transition-colors hover:bg-surface-2">
        <DateChip date={game.startsAt} color={color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{game.title}</p>
          <p className="text-sm text-ink-3">
            {formatGameDate(game.startsAt)} · {formatTime(game.startsAt)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Badge tone={taken >= game.capacity ? "info" : "neutral"}>
              {taken}/{game.capacity} in
            </Badge>
            {unpaid > 0 && (
              <Badge tone="warn" dot>
                {unpaid} unpaid
              </Badge>
            )}
          </div>
        </div>
        <ArrowRight className="size-5 shrink-0 text-ink-3" />
      </div>
    </Link>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-gold-300/85">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-[#f4efe3]">{value}</p>
    </div>
  );
}

function ToolLink({
  href,
  icon,
  title,
  body,
  muted,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <Link href={href} className={muted ? "pointer-events-none" : undefined}>
      <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-2">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-field-800 text-gold-300">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-black text-ink">{title}</p>
            {muted && <Badge tone="neutral">Soon</Badge>}
          </div>
          <p className="mt-1 text-sm leading-5 text-ink-2">{body}</p>
        </div>
        {!muted && <ArrowRight className="mt-2 size-5 text-ink-3" />}
      </div>
    </Link>
  );
}

function ReadinessCard({
  title,
  value,
  body,
  good,
}: {
  title: string;
  value: string;
  body: string;
  good: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink-2">{title}</p>
        {good ? (
          <CheckCircle2 className="size-4 text-ok" />
        ) : (
          <Clock3 className="size-4 text-warn" />
        )}
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink-3">{body}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/42">{label}</p>
      <p className="mt-1 text-lg font-black text-[#f4efe3]">{value}</p>
    </div>
  );
}

function seriesPaymentLabel(paymentMode: string) {
  if (paymentMode === "UPFRONT") return "Upfront";
  if (paymentMode === "WEEKLY_RECURRING") return "Weekly billing";
  return "Per game";
}
