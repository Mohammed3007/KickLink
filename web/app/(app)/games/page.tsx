import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listClubGames } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { GameCard } from "@/components/app/game-card";
import { Segment } from "@/components/ui/segment";
import { Empty } from "@/components/app/empty";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "upcoming" } = await searchParams;
  const user = await requireUser();
  const games = await listClubGames(user.id);

  const mine = games.filter((g) => g.myStatus && g.myStatus !== "CANCELLED");
  const open = games.filter((g) => !g.myStatus);
  const list = tab === "open" ? open : mine;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <PageHeader title="Games" />

      <div className="mt-5">
        <Segment
          active={tab}
          options={[
            { value: "upcoming", label: "Upcoming", href: "/games?tab=upcoming" },
            { value: "open", label: "Open", href: "/games?tab=open" },
          ]}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        {list.length > 0 ? (
          list.map((g) => <GameCard key={g.id} game={g as never} />)
        ) : (
          <Empty
            icon={CalendarDays}
            title={tab === "open" ? "No open games right now" : "No upcoming games"}
            body={
              tab === "open"
                ? "Check back soon — organizers post new games regularly."
                : "Join an open game in one of your clubs."
            }
          />
        )}
      </div>
    </div>
  );
}
