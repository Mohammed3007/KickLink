import Link from "next/link";
import { requireUser } from "@/lib/session";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { CreateClubForm } from "@/components/app/create-club-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NewClubPage() {
  const user = await requireUser();

  if (!user.organizerApproved) {
    return (
      <OrganizerPageShell
        title="Organizer approval required"
        subtitle="KickLink reviews new organizers before they can create clubs and collect player payments."
        active="/manage"
        backHref="/manage"
        compact
      >
        <div className="mx-auto max-w-xl">
          <Card className="p-6">
            <p className="text-sm leading-6 text-ink-2">
              Submit an application and a platform admin can review it from the admin workspace.
              Once approved, you can create clubs, invite players and post games.
            </p>
            <Link href="/manage/apply" className="mt-5 inline-block">
              <Button>Apply to organize</Button>
            </Link>
          </Card>
        </div>
      </OrganizerPageShell>
    );
  }

  return (
    <OrganizerPageShell
      title="Start a club"
      subtitle="Create the private organization players join before they can see and register for your games."
      active="/manage"
      backHref="/manage"
      compact
    >
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-line shadow-card">
          <CreateClubForm />
        </div>
      </div>
    </OrganizerPageShell>
  );
}
