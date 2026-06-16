import Link from "next/link";
import { CalendarDays, Mail, ShieldCheck, Ticket, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { OrganizerPageShell, OrganizerPrimaryAction } from "@/components/app/organizer-shell";
import { CopyInvite } from "@/components/app/copy-invite";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatGameDate, formatTime } from "@/lib/utils";

export default async function ManageMembersPage() {
  const user = await requireUser();
  const upcomingCutoff = new Date();
  upcomingCutoff.setHours(upcomingCutoff.getHours() - 1);
  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    include: {
      memberships: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarColor: true, city: true, skill: true } },
        },
        orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
      },
      games: {
        where: { startsAt: { gte: upcomingCutoff } },
        orderBy: { startsAt: "asc" },
        take: 3,
      },
      _count: { select: { games: true, recurringSeries: true } },
    },
    orderBy: { name: "asc" },
  });

  const totalMembers = orgs.reduce((sum, org) => sum + org.memberships.length, 0);
  const totalPlayers = orgs.reduce(
    (sum, org) => sum + org.memberships.filter((membership) => membership.role === "PLAYER").length,
    0
  );
  const totalOrganizers = orgs.reduce(
    (sum, org) => sum + org.memberships.filter((membership) => membership.role === "ORGANIZER").length,
    0
  );

  return (
    <OrganizerPageShell
      title="Members"
      subtitle="Give testers a clear invite code, see who has joined each club, and verify organizer access."
      active="/manage/members"
      compact
      action={<OrganizerPrimaryAction href="/manage/clubs/new">New club</OrganizerPrimaryAction>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Members" value={String(totalMembers)} icon={<Users className="size-4" />} />
        <Stat label="Players" value={String(totalPlayers)} icon={<Ticket className="size-4" />} />
        <Stat label="Organizers" value={String(totalOrganizers)} icon={<ShieldCheck className="size-4" />} />
      </div>

      <div className="mt-5 grid gap-5">
        {orgs.map((org) => {
          const organizers = org.memberships.filter((membership) => membership.role === "ORGANIZER");
          const players = org.memberships.filter((membership) => membership.role === "PLAYER");
          return (
            <Card key={org.id} className="overflow-hidden p-0">
              <div className="bg-field-950 p-5 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={org.name} color={org.color} size={46} />
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black text-[#f4efe3]">{org.name}</h2>
                      <p className="text-sm text-white/45">
                        {players.length} players - {organizers.length} organizers - {org._count.games} games
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyInvite code={org.inviteCode} handle={org.handle} />
                    <Link
                      href={`/clubs/${org.handle}`}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                    >
                      Public club
                    </Link>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gold-400/15 bg-gold-400/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">Tester join code</p>
                  <p className="mt-1 break-all font-mono text-lg font-black text-[#f4efe3]">{org.inviteCode}</p>
                  <p className="mt-1 text-sm text-white/50">
                    Players can paste this in Clubs to join. Treat it like a revocable invite, not a secret password.
                  </p>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_18rem]">
                <div className="divide-y divide-line-2">
                  {org.memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center gap-3 p-4">
                      <Avatar
                        name={membership.user.name}
                        color={membership.user.avatarColor}
                        size={38}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{membership.user.name}</p>
                        <p className="flex items-center gap-1 text-sm text-ink-3">
                          <Mail className="size-3.5" />
                          <span className="truncate">{membership.user.email}</span>
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium text-ink-2">{membership.user.skill}</p>
                        <p className="text-xs text-ink-3">{membership.user.city}</p>
                      </div>
                      <Badge tone={membership.role === "ORGANIZER" ? "brand" : "neutral"}>
                        {membership.role === "ORGANIZER" ? "Organizer" : "Player"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line bg-surface-2/55 p-4 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-2 text-ink-3">
                    <CalendarDays className="size-4" />
                    <p className="text-xs font-bold uppercase tracking-[0.14em]">Next games</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {org.games.map((game) => (
                      <Link key={game.id} href={`/manage/games/${game.id}`} className="block rounded-xl bg-white/70 p-3 ring-1 ring-line transition-colors hover:bg-white">
                        <p className="truncate text-sm font-bold text-ink">{game.title}</p>
                        <p className="mt-0.5 text-xs text-ink-3">
                          {formatGameDate(game.startsAt)} - {formatTime(game.startsAt)}
                        </p>
                      </Link>
                    ))}
                    {org.games.length === 0 && (
                      <p className="rounded-xl border border-dashed border-line p-3 text-sm text-ink-3">
                        No upcoming games for this club.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </OrganizerPageShell>
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
