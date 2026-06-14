import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listClubs } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { JoinClubForm } from "@/components/app/join-club-form";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function ClubsPage() {
  const user = await requireUser();
  const clubs = await listClubs(user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <PageHeader title="Clubs" />

      <div className="mt-5">
        <JoinClubForm />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-ink-3">
        {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
      </h2>
      <div className="space-y-2.5">
        {clubs.map((club) => (
          <Link key={club.id} href={`/clubs/${club.handle}`}>
            <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop">
              <Avatar name={club.name} color={club.color} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-ink">{club.name}</p>
                  {club.memberships[0]?.role === "ORGANIZER" && (
                    <Badge tone="brand">Organizer</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-ink-3">
                  {club.city} · {club.venue} · {club._count.memberships} members
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-3" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
