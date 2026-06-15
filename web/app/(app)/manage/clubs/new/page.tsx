import Link from "next/link";
import { requireUser } from "@/lib/session";
import { BackHeader } from "@/components/app/back-header";
import { CreateClubForm } from "@/components/app/create-club-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NewClubPage() {
  const user = await requireUser();

  if (!user.organizerApproved) {
    return (
      <div className="mx-auto max-w-xl pb-10">
        <BackHeader title="New club" />
        <div className="px-5 pt-5">
          <Card className="p-6">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
              Organizer approval required
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              KickLink reviews new organizers before they can create clubs and collect player
              payments. Submit an application and we&apos;ll review it from the platform admin
              workspace.
            </p>
            <Link href="/manage/apply" className="mt-5 inline-block">
              <Button>Apply to organize</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

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
