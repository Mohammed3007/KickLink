import { notFound } from "next/navigation";
import Link from "next/link";
import { Megaphone, Users, LayoutDashboard } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClub } from "@/lib/queries";
import { BackHeader } from "@/components/app/back-header";
import { GameCard } from "@/components/app/game-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/app/page-header";
import { timeAgo } from "@/lib/utils";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const user = await requireUser();
  const club = await getClub(handle, user.id);
  if (!club) notFound();

  const isOrganizer = club.memberships[0]?.role === "ORGANIZER";
  const games = club.games.filter((g) => g.myStatus !== "CANCELLED");

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title={club.name} />

      <div className="space-y-3 px-4 pt-3">
        {/* Header */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={club.name} color={club.color} size={60} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-[-0.01em] text-ink">
                  {club.name}
                </h1>
                {isOrganizer && <Badge tone="brand">Organizer</Badge>}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-ink-3">
                <Users className="size-3.5" />
                {club.sport} - {club._count.memberships} members - {club.city}
              </p>
            </div>
          </div>
          {club.blurb && (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
              {club.blurb}
            </p>
          )}
          {isOrganizer && (
            <div className="mt-4 flex items-center gap-3">
              <Link href="/manage" className="flex-1">
                <Button full variant="secondary">
                  <LayoutDashboard className="size-4" /> Manage club
                </Button>
              </Link>
              <div className="rounded-xl bg-surface-2 px-3 py-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-3">
                  Invite code
                </p>
                <p className="font-bold tracking-wider text-brand-700">
                  {club.inviteCode}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Games */}
        <SectionLabel>Upcoming games</SectionLabel>
        {games.length > 0 ? (
          <div className="space-y-2.5">
            {games.map((g) => (
              <GameCard
                key={g.id}
                game={{ ...g, org: { name: club.name, color: club.color } } as never}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-sm text-ink-2">
            No upcoming games scheduled.
          </Card>
        )}

        {/* Announcements */}
        {club.announcements.length > 0 && (
          <>
            <SectionLabel>Announcements</SectionLabel>
            <div className="space-y-2.5">
              {club.announcements.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-ink-3">
                    <Megaphone className="size-4" />
                    <span className="text-xs">
                      {a.author.name} · {timeAgo(a.createdAt)}
                    </span>
                  </div>
                  <p className="font-semibold text-ink">{a.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-2">
                    {a.body}
                  </p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
