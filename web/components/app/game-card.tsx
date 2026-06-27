import { Clock, MapPin } from "lucide-react";
import { LinkCard } from "@/components/ui/card";
import { Badge, RegBadge } from "@/components/ui/badge";
import { DateChip } from "./date-chip";
import { formatPrice, formatTime } from "@/lib/utils";

type GameCardData = {
  id: string;
  title: string;
  sport: string;
  venue: string;
  startsAt: Date;
  priceCents: number;
  capacity: number;
  spotsLeft: number;
  isFull: boolean;
  myStatus?: string | null;
  org: { name: string; color: string };
};

export function GameCard({ game }: { game: GameCardData }) {
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
            {game.priceCents > 0 ? (
              <span className="shrink-0 text-[15px] font-bold text-ink">
                {formatPrice(game.priceCents)}
              </span>
            ) : (
              <Badge tone="ok">Free</Badge>
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

          <div className="mt-2.5">
            {game.myStatus ? (
              <RegBadge status={game.myStatus} />
            ) : game.isFull ? (
              <Badge tone="info" dot>
                Full · waitlist
              </Badge>
            ) : (
              <span className="text-[13px] font-semibold text-ok">
                {game.spotsLeft} spot{game.spotsLeft === 1 ? "" : "s"} left
              </span>
            )}
          </div>
        </div>
      </div>
    </LinkCard>
  );
}
