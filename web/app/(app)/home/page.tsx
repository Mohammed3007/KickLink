import Link from "next/link";
import { ChevronRight, Zap, Clock } from "lucide-react";
import { hasOrganizerAccess, requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/queries";
import { SectionLabel } from "@/components/app/page-header";
import { OrganizerModePage, PlayerModePage } from "@/components/app/organizer-mode-page";
import { GameCard } from "@/components/app/game-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/app/countdown";
import { formatPrice, timeAgo } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireUser();
  const [isOrganizer, dashboard] = await Promise.all([
    hasOrganizerAccess(user.id).catch(() => false),
    getDashboard(user.id).catch(() => ({
    mine: [],
    open: [],
    offers: [],
    unpaid: [],
    announcements: [],
    })),
  ]);
  const { mine, open, offers, unpaid, announcements } = dashboard;

  const activeOffer = offers.find(
    (o) => o.status === "OFFERED" && o.offerExpiresAt && o.offerExpiresAt > new Date()
  );
  const today = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const hasAttention = !!activeOffer || unpaid.length > 0;

  const content = (
    <>
      {/* Needs attention */}
      {hasAttention && (
        <>
          <SectionLabel>Needs your attention</SectionLabel>
          <div className="space-y-3">
            {activeOffer && (
              <Link href={`/games/${activeOffer.gameId}`} className="block">
                <Card className="overflow-hidden ring-2 ring-alert/30">
                  <div className="flex items-center gap-2 bg-alert-bg px-4 py-2.5">
                    <Zap className="size-4 text-alert" fill="currentColor" />
                    <span className="flex-1 text-[13px] font-bold text-alert">
                      A spot just opened up
                    </span>
                    <Badge tone="alert">
                      <Countdown to={activeOffer.offerExpiresAt!} />
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex-1">
                      <p className="font-bold text-ink">{activeOffer.game.title}</p>
                      <p className="text-[13px] text-ink-3">
                        Accept to claim your spot · {activeOffer.game.org.name}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-ink-3" />
                  </div>
                </Card>
              </Link>
            )}

            {unpaid.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="block">
                <Card className="overflow-hidden ring-2 ring-warn/30">
                  <div className="flex items-center gap-2 bg-warn-bg px-4 py-2.5">
                    <Clock className="size-4 text-warn" />
                    <span className="flex-1 text-[13px] font-bold text-warn">
                      Payment due
                    </span>
                    <Badge tone="warn" dot>
                      Provisional
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex-1">
                      <p className="font-bold text-ink">{g.title as string}</p>
                      <p className="text-[13px] text-ink-3">
                        Pay {formatPrice(g.priceCents as number)} to keep your spot
                      </p>
                    </div>
                    <Button size="sm">Pay now</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Upcoming */}
          <SectionLabel
            action={
              <Link href="/games" className={isOrganizer ? "text-sm font-bold text-gold-500" : "text-sm font-semibold text-brand-700"}>
                See all
              </Link>
            }
      >
        Your upcoming games
      </SectionLabel>
      {mine.length > 0 ? (
        <div className="space-y-2.5">
          {mine.slice(0, 4).map((g) => (
            <GameCard key={g.id} game={g as never} />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center text-sm text-ink-2">
          No upcoming games yet — join one below.
        </Card>
      )}

      {/* Open games */}
      {open.length > 0 && (
        <>
          <SectionLabel
            action={
              <Link href="/clubs" className={isOrganizer ? "text-sm font-bold text-gold-500" : "text-sm font-semibold text-brand-700"}>
                Clubs
              </Link>
            }
          >
            Open games in your clubs
          </SectionLabel>
          <div className="space-y-2.5">
            {open.slice(0, 3).map((g) => (
              <GameCard key={g.id} game={g as never} />
            ))}
          </div>
        </>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <>
          <SectionLabel>Latest from your clubs</SectionLabel>
          <div className="space-y-2.5">
            {announcements.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="mb-2 flex items-center gap-2.5">
                  <Avatar name={a.org.name} color={a.org.color} size={28} />
                  <span className="flex-1 text-[13px] font-bold text-ink">
                    {a.org.name}
                  </span>
                  <span className="text-xs text-ink-3">{timeAgo(a.createdAt)}</span>
                </div>
                <p className="font-semibold text-ink">{a.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{a.body}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );

  if (isOrganizer) {
    return (
      <OrganizerModePage title={`Hi, ${user.name.split(" ")[0]}`} subtitle={`${today}. Keep an eye on your games, payments and member updates.`}>
        {content}
      </OrganizerModePage>
    );
  }

  return (
    <PlayerModePage
      title={`Hi, ${user.name.split(" ")[0]}`}
      subtitle={`${today}. Find your games, receipts and club updates in one place.`}
    >
      {content}
    </PlayerModePage>
  );
}
