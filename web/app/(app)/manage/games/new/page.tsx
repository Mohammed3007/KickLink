import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { BackHeader } from "@/components/app/back-header";
import { CreateGameForm } from "@/components/app/create-game-form";

export default async function NewGamePage() {
  const user = await requireUser();
  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (orgs.length === 0) redirect("/manage");

  return (
    <div className="mx-auto max-w-xl pb-10">
      <BackHeader title="New game" />
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          Create a game
        </h1>
        <p className="mt-1 text-ink-2">
          Set it up once — players can find and join in seconds.
        </p>
        <div className="mt-6">
          <CreateGameForm orgs={orgs} />
        </div>
      </div>
    </div>
  );
}
