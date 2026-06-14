import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Users, Wallet, Clock } from "lucide-react";
import { requireUser, isOrganizer } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, PayBadge } from "@/components/ui/badge";
import { RosterActions } from "@/components/app/roster-actions";
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

  const paidCount = game.registrations.filter((r) => r.payStatus === "PAID").length;
  const revenue = paidCount * game.priceCents;
  const unpaid = game.confirmed.filter((r) => r.status === "PROVISIONAL");

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title="Manage game" />

      <div className="space-y-3 px-4 pt-3">
        <Card className="p-5">
          <h1 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {game.title}
          </h1>
          <p className="text-sm text-ink-3">
            {formatGameDate(game.startsAt)} · {formatTime(game.startsAt)} ·{" "}
            {game.venue}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Stat icon={<Users className="size-4" />} label="Filled" value={`${game.taken}/${game.capacity}`} />
            <Stat icon={<Clock className="size-4" />} label="Unpaid" value={String(unpaid.length)} />
            <Stat icon={<Wallet className="size-4" />} label="Collected" value={formatPrice(revenue)} />
          </div>
          <Link
            href={`/games/${game.id}`}
            className="mt-4 inline-block text-sm font-semibold text-brand-700"
          >
            View public page →
          </Link>
        </Card>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-3">
            Roster · {game.confirmed.length}/{game.capacity}
          </h2>
          <Card className="divide-y divide-line-2">
            {game.confirmed.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3.5">
                <Avatar name={r.user.name} color={r.user.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{r.user.name}</p>
                  <PayBadge status={r.payStatus} />
                </div>
                <RosterActions
                  registrationId={r.id}
                  showMarkPaid={r.status === "PROVISIONAL"}
                />
              </div>
            ))}
            {game.confirmed.length === 0 && (
              <p className="p-4 text-sm text-ink-3">No players yet.</p>
            )}
          </Card>
        </section>

        {game.waitlist.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-3">
              Waitlist · {game.waitlist.length}
            </h2>
            <Card className="divide-y divide-line-2">
              {game.waitlist.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 p-3.5">
                  <span className="w-5 text-center text-sm font-semibold text-ink-3">
                    {i + 1}
                  </span>
                  <Avatar name={r.user.name} color={r.user.avatarColor} size={36} />
                  <span className="flex-1 font-medium text-ink">{r.user.name}</span>
                  <Badge tone="info">Waiting</Badge>
                </div>
              ))}
            </Card>
          </section>
        )}
      </div>
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
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
