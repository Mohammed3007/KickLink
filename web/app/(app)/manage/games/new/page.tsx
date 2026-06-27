import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { CreateGameForm } from "@/components/app/create-game-form";

export default async function NewGamePage() {
  const user = await requireUser();
  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    select: { id: true, name: true, sport: true },
    orderBy: { name: "asc" },
  });

  if (orgs.length === 0) redirect("/manage");

  return (
    <OrganizerPageShell
      title="Create a game"
      subtitle="Set up one-off or weekly games for any sport, roster size, venue and payment model."
      active="/manage/games/new"
      backHref="/manage"
      compact
    >
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-line shadow-card">
          <CreateGameForm orgs={orgs} />
        </div>
      </div>
    </OrganizerPageShell>
  );
}
