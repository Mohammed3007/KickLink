import { CalendarCheck, Clock, MapPin } from "lucide-react";
import { LinkCard } from "@/components/ui/card";
import { Badge, PayBadge, RegBadge } from "@/components/ui/badge";
import { DateChip } from "@/components/app/date-chip";
import { formatPrice, formatTime, timeAgo } from "@/lib/utils";

type HistoryGameCardData = {
  id: string;
  title: string;
  sport: string;
  venue: string;
  startsAt: Date;
  priceCents: number;
  myStatus: string;
  payStatus: string;
  waitlistPos?: number | null;
  registeredAt: Date;
  updatedAt: Date;
  isPast: boolean;
  org: { name: string; color: string };
};

export function HistoryGameCard({ game }: { game: HistoryGameCardData }) {
  return (
    <LinkCard href={`/games/${game.id}`} className="p-3.5">
      <div className="flex gap-3.5">
        <DateChip date={game.startsAt} color={game.org.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold tracking-[-0.01em] text-ink">
                {game.title}
              </h3>
              <p className="mt-0.5 truncate text-[13px] text-ink-3">
                {game.sport} - {game.org.name}
              </p>
            </div>
            {game.isPast ? (
              <Badge tone="neutral">Past</Badge>
            ) : (
              <Badge tone="info">Upcoming</Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-ink-3" />
              {formatTime(game.startsAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-ink-3" />
              <span className="truncate">{game.venue}</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RegBadge status={game.myStatus} />
            <PayBadge status={game.payStatus} />
            {game.waitlistPos ? (
              <Badge tone="info">#{game.waitlistPos} waitlist</Badge>
            ) : null}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3">
              <CalendarCheck className="size-3.5" />
              {game.myStatus === "CANCELLED"
                ? `Updated ${timeAgo(game.updatedAt)}`
                : `Joined ${timeAgo(game.registeredAt)}`}
            </span>
          </div>

          {game.priceCents > 0 ? (
            <p className="mt-2 text-[13px] font-semibold text-ink-2">
              Game fee {formatPrice(game.priceCents)}
            </p>
          ) : null}
        </div>
      </div>
    </LinkCard>
  );
}
