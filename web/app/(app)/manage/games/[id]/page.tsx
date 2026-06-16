import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Users, Wallet } from "lucide-react";
import { requireUser, isOrganizer } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, PayBadge } from "@/components/ui/badge";
import { RosterActions } from "@/components/app/roster-actions";
import { WaitlistActions } from "@/components/app/waitlist-actions";
import { formatPrice, formatGameDate, formatTime } from "@/lib/utils";

export default async function ManageGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const game = await getGame(id, user.id);
  if (!game) notFound();
  if (!(await isOrganizer(user.id, game.orgId))) redirect(`/games/${id}`);

  const paidCount = game.registrations.filter((registration) => registration.payStatus === "PAID").length;
  const revenue = paidCount * game.priceCents;
  const unpaid = game.confirmed.filter((registration) => registration.status === "PROVISIONAL");
  const presentCount = game.confirmed.filter((registration) => registration.attendance?.status === "PRESENT").length;
  const noShowCount = game.confirmed.filter((registration) => registration.attendance?.status === "NO_SHOW").length;
  const offers = game.registrations.filter((registration) => registration.status === "OFFERED");
  const cancelled = game.registrations
    .filter((registration) => registration.status === "CANCELLED")
    .slice()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);
  const canOfferWaitlist = game.taken < game.capacity;

  return (
    <OrganizerPageShell
      title={game.title}
      subtitle={`${formatGameDate(game.startsAt)} · ${formatTime(game.startsAt)} · ${game.venue}`}
      active="/manage/games"
      backHref="/manage/games"
      compact
      action={
        <Link
          href={`/games/${game.id}`}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-5 text-sm font-bold text-white transition-colors hover:bg-white/14"
        >
          View public page
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            <Stat icon={<Users className="size-4" />} label="Filled" value={`${game.taken}/${game.capacity}`} />
            <Stat icon={<Clock className="size-4" />} label="Unpaid" value={String(unpaid.length)} />
            <Stat icon={<Wallet className="size-4" />} label="Collected" value={formatPrice(revenue)} />
            <Stat icon={<Users className="size-4" />} label="Present" value={String(presentCount)} />
            <Stat icon={<Users className="size-4" />} label="No-show" value={String(noShowCount)} />
          </div>
        </Card>

        <RosterSection title={`Roster · ${game.confirmed.length}/${game.capacity}`}>
          <Card className="divide-y divide-line-2">
            {game.confirmed.map((registration) => (
              <div key={registration.id} className="flex items-center gap-3 p-3.5">
                <Avatar name={registration.user.name} color={registration.user.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{registration.user.name}</p>
                  <PayBadge status={registration.payStatus} />
                </div>
                <RosterActions
                  registrationId={registration.id}
                  showMarkPaid={registration.status === "PROVISIONAL"}
                  attendanceStatus={registration.attendance?.status ?? null}
                />
              </div>
            ))}
            {game.confirmed.length === 0 && (
              <p className="p-4 text-sm text-ink-3">No players yet.</p>
            )}
          </Card>
        </RosterSection>

        {offers.length > 0 && (
          <RosterSection title={`Spot offers · ${offers.length}`}>
            <Card className="divide-y divide-line-2">
              {offers.map((registration) => (
                <div key={registration.id} className="flex items-center gap-3 p-3.5">
                  <Avatar name={registration.user.name} color={registration.user.avatarColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{registration.user.name}</p>
                    <p className="text-xs text-ink-3">
                      Expires {registration.offerExpiresAt ? registration.offerExpiresAt.toLocaleTimeString() : "soon"}
                    </p>
                  </div>
                  <Badge tone="alert">Offered</Badge>
                  <RosterActions
                    registrationId={registration.id}
                    showMarkPaid={false}
                    attendanceStatus={registration.attendance?.status ?? null}
                  />
                </div>
              ))}
            </Card>
          </RosterSection>
        )}

        {game.waitlist.length > 0 && (
          <RosterSection title={`Waitlist · ${game.waitlist.length}`}>
            <Card className="divide-y divide-line-2">
              {game.waitlist.map((registration, index) => (
                <div key={registration.id} className="flex items-center gap-3 p-3.5">
                  <span className="w-5 text-center text-sm font-semibold text-ink-3">{index + 1}</span>
                  <Avatar name={registration.user.name} color={registration.user.avatarColor} size={36} />
                  <span className="flex-1 font-medium text-ink">{registration.user.name}</span>
                  <Badge tone="info">Waiting</Badge>
                  <WaitlistActions registrationId={registration.id} canOffer={canOfferWaitlist} />
                </div>
              ))}
            </Card>
            {!canOfferWaitlist && (
              <p className="mt-2 px-1 text-xs text-ink-3">
                A spot must open before a waitlisted player can be offered a place.
              </p>
            )}
          </RosterSection>
        )}

        {cancelled.length > 0 && (
          <RosterSection title={`Recently cancelled · ${cancelled.length}`}>
            <Card className="divide-y divide-line-2">
              {cancelled.map((registration) => (
                <div key={registration.id} className="flex items-center gap-3 p-3.5 opacity-80">
                  <Avatar name={registration.user.name} color={registration.user.avatarColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{registration.user.name}</p>
                    <p className="text-xs text-ink-3">Cancelled {registration.updatedAt.toLocaleString()}</p>
                  </div>
                  <Badge tone="bad">Cancelled</Badge>
                </div>
              ))}
            </Card>
          </RosterSection>
        )}
      </div>
    </OrganizerPageShell>
  );
}

function RosterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-3">{title}</h2>
      {children}
    </section>
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
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}
