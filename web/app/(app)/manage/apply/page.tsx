import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { BackHeader } from "@/components/app/back-header";
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
      <div className="mx-auto max-w-xl pb-10">
        <BackHeader title="Organizer approval" />
        <div className="px-5 pt-5">
          <Card className="p-6">
            <Badge tone="ok" dot>Approved</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink">
              You can create clubs
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Your organizer access is approved. Create a club when you are ready.
            </p>
            <Link href="/manage/clubs/new" className="mt-5 inline-block">
              <Button>Create club</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pb-10">
      <BackHeader title="Organizer application" />
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          Apply to organize
        </h1>
        <p className="mt-1 text-ink-2">
          Tell us about the pickup group you want to run on KickLink.
        </p>

        {latest ? (
          <Card className="mt-6 p-5">
            {params.submitted === "1" && (
              <div className="mb-4 rounded-xl bg-good-bg px-3.5 py-3 text-sm font-semibold text-good">
                Application received. A platform admin can now review it.
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-ink">{latest.clubName}</h2>
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
          <div className="mt-6">
            <OrganizerApplicationForm error={formError} />
          </div>
        )}

        {latest?.status === "REJECTED" && (
          <div className="mt-6">
            <OrganizerApplicationForm error={formError} />
          </div>
        )}
      </div>
    </div>
  );
}
