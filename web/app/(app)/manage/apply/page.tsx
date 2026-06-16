import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { OrganizerApplicationForm } from "@/components/app/organizer-application-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function OrganizerApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const formError =
    params.error === "invalid" ? "Check the application details and try again." : undefined;
  const applications = await db.organizerApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const latest = applications[0];

  if (user.organizerApproved) {
    return (
      <OrganizerPageShell
        title="Organizer access approved"
        subtitle="You can create clubs, post games and connect payout accounts for your organizations."
        active="/manage"
        backHref="/manage"
        compact
      >
        <div className="mx-auto max-w-xl">
          <Card className="p-6">
            <Badge tone="ok" dot>
              Approved
            </Badge>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.02em] text-ink">
              Ready to create your first club
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Create a club when you are ready. Players can join that private organization before
              registering for games.
            </p>
            <Link href="/manage/clubs/new" className="mt-5 inline-block">
              <Button>Create club</Button>
            </Link>
          </Card>
        </div>
      </OrganizerPageShell>
    );
  }

  return (
    <OrganizerPageShell
      title="Apply to organize"
      subtitle="Tell us about the pickup group you want to run on KickLink."
      active="/manage"
      backHref="/manage"
      compact
    >
      <div className="mx-auto max-w-xl">
        {latest ? (
          <Card className="p-5">
            {params.submitted === "1" && (
              <div className="mb-4 rounded-xl bg-ok-bg px-3.5 py-3 text-sm font-semibold text-ok">
                Application received. A platform admin can now review it.
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-ink">{latest.clubName}</h2>
                <p className="text-sm text-ink-2">{latest.city}</p>
              </div>
              <Badge tone={latest.status === "REJECTED" ? "bad" : "warn"} dot>
                {latest.status.toLowerCase()}
              </Badge>
            </div>
            {latest.adminNote && (
              <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
                {latest.adminNote}
              </p>
            )}
          </Card>
        ) : (
          <Card className="p-5">
            <OrganizerApplicationForm error={formError} />
          </Card>
        )}

        {latest?.status === "REJECTED" && (
          <Card className="mt-5 p-5">
            <OrganizerApplicationForm error={formError} />
          </Card>
        )}
      </div>
    </OrganizerPageShell>
  );
}
