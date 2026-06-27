import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, DollarSign, ListFilter, Repeat2, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { OrganizerPageShell, OrganizerPrimaryAction } from "@/components/app/organizer-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateChip } from "@/components/app/date-chip";
import { formatGameDate, formatPrice, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"];

export default async function ManageGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { view = "upcoming" } = await searchParams;
  const now = new Date();
  const upcomingCutoff = new Date(now);
  upcomingCutoff.setHours(upcomingCutoff.getHours() - 1);
  const timeFilter =
    view === "past" ? { lt: now } : view === "all" ? undefined : { gte: upcomingCutoff };

  const games = await db.game.findMany({
    where: {
      ...(timeFilter ? { startsAt: timeFilter } : {}),
      org: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    },
    include: {
      org: { select: { id: true, name: true, color: true, handle: true, chargesEnabled: true } },
      registrations: {
        include: {
          attendance: { select: { status: true } },
        },
      },
      series: { select: { id: true, occurrenceCount: true, paymentMode: true } },
    },
    orderBy: { startsAt: view === "past" ? "desc" : "asc" },
  });

  const stats = games.reduce(
    (acc, game) => {
      const filled = game.registrations.filter((registration) => OCCUPYING.includes(registration.status)).length;
      const unpaid = game.registrations.filter((registration) => registration.payStatus === "UNPAID").length;
      const waitlisted = game.registrations.filter((registration) => registration.status === "WAITLISTED").length;
      const paid = game.registrations.filter((registration) => registration.payStatus === "PAID").length;
      return {
        games: acc.games + 1,
        filled: acc.filled + filled,
        unpaid: acc.unpaid + unpaid,
        waitlisted: acc.waitlisted + waitlisted,
        collected: acc.collected + paid * game.priceCents,
      };
    },
    { games: 0, filled: 0, unpaid: 0, waitlisted: 0, collected: 0 }
  );

  return (
    <OrganizerPageShell
      title="Games"
      subtitle="Review every fixture, jump into rosters, check waitlists and spot payment issues before kickoff."
      active="/manage/games"
      compact
      action={<OrganizerPrimaryAction href="/manage/games/new">New game</OrganizerPrimaryAction>}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Games" value={String(stats.games)} icon={<CalendarDays className="size-4" />} />
        <Stat label="Players in" value={String(stats.filled)} icon={<Users className="size-4" />} />
        <Stat label="Waitlist" value={String(stats.waitlisted)} icon={<ListFilter className="size-4" />} />
        <Stat label="Collected" value={formatPrice(stats.collected)} icon={<DollarSign className="size-4" />} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterLink href="/manage/games" active={view === "upcoming"}>Upcoming</FilterLink>
        <FilterLink href="/manage/games?view=past" active={view === "past"}>Past</FilterLink>
        <FilterLink href="/manage/games?view=all" active={view === "all"}>All</FilterLink>
      </div>

      <Card className="mt-4 divide-y divide-line-2 overflow-hidden p-0">
        {games.map((game) => {
          const filled = game.registrations.filter((registration) => OCCUPYING.includes(registration.status)).length;
          const waitlisted = game.registrations.filter((registration) => registration.status === "WAITLISTED").length;
          const unpaid = game.registrations.filter((registration) => registration.payStatus === "UNPAID").length;
          const present = game.registrations.filter((registration) => registration.attendance?.status === "PRESENT").length;
          const noShow = game.registrations.filter((registration) => registration.attendance?.status === "NO_SHOW").length;

          return (
            <Link key={game.id} href={`/manage/games/${game.id}`} className="block transition-colors hover:bg-surface-2/75">
              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_18rem] lg:items-center">
                <div className="flex min-w-0 gap-3">
                  <DateChip date={game.startsAt} color={game.org.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-black text-ink">{game.title}</h2>
                      <Badge tone="brand">{game.sport}</Badge>
                      {game.seriesId && (
                        <Badge tone="info">
                          <Repeat2 className="size-3.5" /> Weekly
                        </Badge>
                      )}
                      <Badge tone={filled >= game.capacity ? "warn" : "neutral"}>
                        {filled}/{game.capacity} in
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-3">
                      {game.org.name} - {formatGameDate(game.startsAt)} - {formatTime(game.startsAt)} - {game.venue}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={waitlisted > 0 ? "info" : "neutral"}>{waitlisted} waitlisted</Badge>
                      <Badge tone={unpaid > 0 ? "warn" : "neutral"}>{unpaid} unpaid</Badge>
                      <Badge tone={present + noShow > 0 ? "ok" : "neutral"}>
                        {present} present / {noShow} no-show
                      </Badge>
                      <Badge tone={game.model === "PAY" ? "brand" : game.model === "LATER" ? "warn" : "ok"}>
                        {game.model === "PAY" ? "Pay now" : game.model === "LATER" ? "Pay later" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2/70 p-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Roster status</p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {filled >= game.capacity ? "Full" : `${game.capacity - filled} spots open`}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-ink-3" />
                </div>
              </div>
            </Link>
          );
        })}
        {games.length === 0 && (
          <div className="p-8 text-center">
            <Clock3 className="mx-auto size-9 text-ink-3" />
            <h2 className="mt-3 text-lg font-black text-ink">No games in this view</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-2">
              Create a one-off game or generate a weekly series for organizers to test roster and payment flows.
            </p>
            <div className="mt-4">
              <OrganizerPrimaryAction href="/manage/games/new">Create game</OrganizerPrimaryAction>
            </div>
          </div>
        )}
      </Card>
    </OrganizerPageShell>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-bold transition-colors",
        active ? "bg-field-950 text-gold-300" : "bg-surface text-ink-2 ring-1 ring-line hover:bg-surface-2"
      )}
    >
      {children}
    </Link>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-3">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-ink">{value}</p>
    </Card>
  );
}
