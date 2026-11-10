import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { isPlatformAdminUser } from "@/lib/admin";
import { setLeadHandled } from "@/lib/actions/leads";
import { formatGameDate, formatTime } from "@/lib/utils";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const user = await requireUser();
  if (!isPlatformAdminUser(user)) redirect("/home");

  const leads = await db.organizerLead.findMany({
    orderBy: [{ handledAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
    take: 100,
  });
  const open = leads.filter((l) => !l.handledAt).length;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <BackHeader title="Admin" />
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Organizer leads</h1>
            <p className="mt-1 text-ink-2">
              Requests from the landing page&apos;s &ldquo;Organize a club?&rdquo; form. {open} waiting for a reply.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/analytics">
              <Button variant="secondary">Analytics</Button>
            </Link>
            <Link href="/admin/applications">
              <Button variant="secondary">Applications</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {leads.length === 0 && <Card className="p-6 text-sm text-ink-2">No requests yet.</Card>}

          {leads.map((lead) => (
            <Card key={lead.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink">{lead.club || lead.name}</h2>
                    {lead.handledAt ? <Badge tone="neutral">Handled</Badge> : <Badge tone="warn" dot>New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-2">
                    {lead.name} ·{" "}
                    <a className="text-brand-600 underline-offset-4 hover:underline" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                    {lead.sport && <> · {lead.sport}</>}
                  </p>
                  <p className="mt-1 text-xs text-ink-3">
                    {formatGameDate(lead.createdAt)}, {formatTime(lead.createdAt)}
                  </p>
                </div>
                <form action={setLeadHandled.bind(null, lead.id, !lead.handledAt)}>
                  <Button variant="secondary" type="submit">
                    {lead.handledAt ? "Reopen" : "Mark handled"}
                  </Button>
                </form>
              </div>
              {lead.message && (
                <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-2 p-3 text-sm text-ink-2">{lead.message}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
