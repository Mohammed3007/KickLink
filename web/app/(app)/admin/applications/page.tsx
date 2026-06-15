import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { isPlatformAdminUser } from "@/lib/admin";
import { decideOrganizerApplication } from "@/lib/actions/organizer-applications";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminApplicationsPage() {
  const user = await requireUser();
  if (!isPlatformAdminUser(user)) redirect("/home");

  const applications = await db.organizerApplication.findMany({
    include: {
      user: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <BackHeader title="Admin" />
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
              Organizer applications
            </h1>
            <p className="mt-1 text-ink-2">
              Review organizer access before users can create clubs or collect payments.
            </p>
          </div>
          <Link href="/admin/audit">
            <Button variant="secondary">Audit history</Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {applications.length === 0 && (
            <Card className="p-6 text-sm text-ink-2">No organizer applications yet.</Card>
          )}

          {applications.map((application) => (
            <Card key={application.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-ink">{application.clubName}</h2>
                  <p className="text-sm text-ink-2">
                    {application.user.name} · {application.user.email} · {application.city}
                  </p>
                </div>
                <Badge
                  tone={
                    application.status === "APPROVED"
                      ? "ok"
                      : application.status === "REJECTED"
                        ? "bad"
                        : "warn"
                  }
                  dot
                >
                  {application.status.toLowerCase()}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-ink-2 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-ink">Expected players</dt>
                  <dd>{application.expectedPlayers}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Submitted</dt>
                  <dd>{application.createdAt.toLocaleString()}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm leading-6 text-ink-2">
                {application.experience}
              </p>

              {application.status === "PENDING" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DecisionForm
                    applicationId={application.id}
                    decision="APPROVED"
                    label="Approve"
                  />
                  <DecisionForm
                    applicationId={application.id}
                    decision="REJECTED"
                    label="Reject"
                  />
                </div>
              ) : (
                <p className="mt-4 text-xs text-ink-3">
                  Reviewed by {application.reviewedBy?.name ?? "admin"}
                  {application.adminNote ? ` · ${application.adminNote}` : ""}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DecisionForm({
  applicationId,
  decision,
  label,
}: {
  applicationId: string;
  decision: "APPROVED" | "REJECTED";
  label: string;
}) {
  return (
    <form action={decideOrganizerApplication} className="space-y-2">
      <input name="applicationId" type="hidden" value={applicationId} />
      <input name="decision" type="hidden" value={decision} />
      <input
        className="h-11 w-full rounded-xl bg-surface px-3.5 text-[15px] text-ink ring-1 ring-line placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        name="adminNote"
        placeholder={decision === "APPROVED" ? "Approval note" : "Reason for rejection"}
        required={decision === "REJECTED"}
      />
      <Button full type="submit" variant={decision === "APPROVED" ? "primary" : "danger"}>
        {label}
      </Button>
    </form>
  );
}
