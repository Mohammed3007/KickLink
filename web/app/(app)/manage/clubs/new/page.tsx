import { requireUser } from "@/lib/session";
import { BackHeader } from "@/components/app/back-header";
import { CreateClubForm } from "@/components/app/create-club-form";

export default async function NewClubPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-xl pb-10">
      <BackHeader title="New club" />
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          Start a club
        </h1>
        <p className="mt-1 text-ink-2">
          You&apos;ll be the organizer. Invite players with a code, then post your
          first game.
        </p>
        <div className="mt-6">
          <CreateClubForm />
        </div>
      </div>
    </div>
  );
}
