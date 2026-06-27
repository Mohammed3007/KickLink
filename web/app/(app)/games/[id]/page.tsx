import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Repeat2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { BackHeader } from "@/components/app/back-header";
import { GameCta } from "@/components/app/game-cta";
import { RegistrationSummary } from "@/components/app/registration-summary";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarStack } from "@/components/ui/avatar";
import { formatPrice, formatGameDate, formatTime } from "@/lib/utils";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const game = await getGame(id, user.id);
  if (!game) notFound();

  const priceLabel = formatPrice(game.priceCents);
  const filledPct = Math.min(100, Math.round((game.taken / game.capacity) * 100));
  const seriesPayment =
    game.series?.paymentMode === "UPFRONT"
      ? "Upfront series pass"
      : game.series?.paymentMode === "WEEKLY_RECURRING"
        ? "Weekly recurring billing"
        : "Pay per game";

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title={game.title} />

      <div className="space-y-3 px-4 pt-3">
        {/* Hero */}
        <div className="bg-brand-field relative overflow-hidden rounded-3xl p-6 text-white shadow-brand">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand" className="bg-white/20 text-white">
                {game.sport}
              </Badge>
              <Badge tone="brand" className="bg-white/20 text-white">
                {game.format}
              </Badge>
              <Badge tone="brand" className="bg-white/20 text-white">
                {game.skill}
              </Badge>
              <Badge tone="brand" className="bg-white/20 text-white">
                {game.durationMins} min
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em]">
              {game.title}
            </h1>
            <div className="mt-1.5 flex items-center justify-between">
              <Link
                href={`/clubs/${game.org.handle}`}
                className="text-white/85 hover:text-white"
              >
                {game.org.name}
              </Link>
              <span className="text-xl font-bold">
                {game.priceCents > 0 ? priceLabel : "Free"}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <Card className="divide-y divide-line-2">
          <Detail icon={<CalendarDays className="size-5" />} label="Date" value={formatGameDate(game.startsAt)} />
          <Detail icon={<Clock className="size-5" />} label="Kickoff" value={`${formatTime(game.startsAt)} · ${game.durationMins} min`} />
          <Detail icon={<MapPin className="size-5" />} label="Venue" value={game.venue} sub={game.address} />
        </Card>

        {game.series && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">
                <Repeat2 className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">Weekly recurring pickup</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">
                  Occurrence {game.occurrenceIndex ?? "-"} of {game.series.occurrenceCount} in{" "}
                  {game.series.title}.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="info">Weekly</Badge>
                  <Badge tone="neutral">{seriesPayment}</Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Roster */}
        <Link href={`/games/${game.id}/participants`}>
          <Card className="p-4 transition-colors hover:bg-surface-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">
                {game.taken} of {game.capacity} spots filled
              </span>
              <span className="inline-flex items-center text-sm font-semibold text-brand-700">
                View players <ChevronRight className="size-4" />
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${filledPct}%` }}
              />
            </div>
            {game.confirmed.length > 0 && (
              <div className="mt-3">
                <AvatarStack
                  names={game.confirmed.map((r) => r.user.name)}
                  max={8}
                  size={30}
                />
              </div>
            )}
          </Card>
        </Link>

        {/* Viewer registration state */}
        <RegistrationSummary
          registration={game.myReg}
          game={{
            model: game.model,
            startsAt: game.startsAt,
            priceCents: game.priceCents,
          }}
        />

        {/* Policy */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-brand-600">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">Cancellation policy</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                {game.policy}
              </p>
              {game.transfers === "ALLOWED" && (
                <p className="mt-2 text-sm text-ink-2">
                  Spot transfers allowed
                  {game.transferApproval ? " (organizer approval required)." : "."}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="pt-2">
          <GameCta
            gameId={game.id}
            model={game.model}
            priceLabel={priceLabel}
            isFull={game.isFull}
            myStatus={game.myReg?.status ?? null}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4">
      <span className="text-ink-3">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
          {label}
        </p>
        <p className="font-semibold text-ink">{value}</p>
        {sub && <p className="text-sm text-ink-3">{sub}</p>}
      </div>
    </div>
  );
}
