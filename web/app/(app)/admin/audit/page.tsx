import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { isPlatformAdminUser } from "@/lib/admin";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function actionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function AdminAuditPage() {
  const user = await requireUser();
  if (!isPlatformAdminUser(user)) redirect("/home");

  const entries = await db.auditLogEntry.findMany({
    include: {
      actor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <BackHeader title="Admin" />
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
              Audit history
            </h1>
            <p className="mt-1 text-ink-2">
              Sensitive platform and organizer actions recorded by the server.
            </p>
          </div>
          <Link href="/admin/applications">
            <Button variant="secondary">Applications</Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {entries.length === 0 && (
            <Card className="p-6 text-sm text-ink-2">No audit entries yet.</Card>
          )}

          {entries.map((entry) => (
            <Card key={entry.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Badge tone="info" dot>
                    {actionLabel(entry.action)}
                  </Badge>
                  <h2 className="mt-3 font-bold text-ink">
                    {entry.targetType} · {entry.targetId.slice(0, 10)}
                  </h2>
                  <p className="mt-1 text-sm text-ink-2">
                    {entry.actor
                      ? `${entry.actor.name} · ${entry.actor.email}`
                      : "System or deleted actor"}
                  </p>
                </div>
                <p className="text-xs font-semibold text-ink-3">
                  {entry.createdAt.toLocaleString()}
                </p>
              </div>

              {entry.reason && (
                <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
                  {entry.reason}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
