import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { hasOrganizerAccess, requireUser } from "@/lib/session";
import { listAvailableSports, listClubGames, listPlayerGameHistory } from "@/lib/queries";
import { OrganizerModePage, PlayerModePage } from "@/components/app/organizer-mode-page";
import { GameCard } from "@/components/app/game-card";
import { HistoryGameCard } from "@/components/app/history-game-card";
import { Segment } from "@/components/ui/segment";
import { Empty } from "@/components/app/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sport?: string; q?: string }>;
}) {
  const { tab = "upcoming", sport = "all", q = "" } = await searchParams;
  const user = await requireUser();
  const filters = { sport, query: q };
  const [isOrganizer, games, history, sports] = await Promise.all([
    hasOrganizerAccess(user.id).catch(() => false),
    listClubGames(user.id, filters),
    tab === "history" ? listPlayerGameHistory(user.id, filters) : Promise.resolve([]),
    listAvailableSports(user.id),
  ]);

  const mine = games.filter((g) => g.myStatus && g.myStatus !== "CANCELLED");
  const open = games.filter((g) => !g.myStatus);
  const list = tab === "open" ? open : mine;
  const emptyTitle =
    tab === "history"
      ? "No game history yet"
      : tab === "open"
        ? "No open games right now"
        : "No upcoming games";
  const emptyBody =
    tab === "history"
      ? "Your registrations, cancellations, and past games will appear here."
      : tab === "open"
        ? "Check back soon - organizers post new games regularly."
        : "Join an open game in one of your clubs.";

  const content = (
    <>
      <div className="mt-5">
        <Segment
          active={tab}
          options={[
            { value: "upcoming", label: "Upcoming", href: gamesHref({ tab: "upcoming", sport, q }) },
            { value: "open", label: "Open", href: gamesHref({ tab: "open", sport, q }) },
            { value: "history", label: "History", href: gamesHref({ tab: "history", sport, q }) },
          ]}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-gold-400/15 bg-white/70 p-3 shadow-card">
        <form action="/games" className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="sport" value={sport} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search sport, club, venue or game"
              className="pl-9"
            />
          </div>
          <button className="h-11 rounded-xl bg-field-950 px-4 text-sm font-bold text-gold-300 transition-colors hover:bg-field-900">
            Search
          </button>
        </form>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <SportPill href={gamesHref({ tab, sport: "all", q })} active={sport === "all"}>
            All sports
          </SportPill>
          {sports.map((option) => (
            <SportPill key={option} href={gamesHref({ tab, sport: option, q })} active={sport === option}>
              {option}
            </SportPill>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {tab === "history" && history.length > 0 ? (
          history.map((g) => <HistoryGameCard key={`${g.id}-${g.myStatus}`} game={g} />)
        ) : tab !== "history" && list.length > 0 ? (
          list.map((g) => <GameCard key={g.id} game={g as never} />)
        ) : (
          <Empty icon={CalendarDays} title={emptyTitle} body={emptyBody} />
        )}
      </div>
    </>
  );

  if (isOrganizer) {
    return (
      <OrganizerModePage
        title="Games"
      subtitle="Browse the games you are playing in, plus open games across your clubs."
      >
        {content}
      </OrganizerModePage>
    );
  }

  return (
    <PlayerModePage
      title="Games"
      subtitle="Track upcoming games, open spots and history across every sport in your clubs."
    >
      {content}
    </PlayerModePage>
  );
}

function gamesHref({
  tab,
  sport,
  q,
}: {
  tab: string;
  sport: string;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (sport && sport !== "all") params.set("sport", sport);
  if (q?.trim()) params.set("q", q.trim());
  return `/games?${params.toString()}`;
}

function SportPill({
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
        "shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
        active
          ? "bg-gold-400 text-field-950"
          : "bg-surface text-ink-2 ring-1 ring-line hover:bg-surface-2 hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}
