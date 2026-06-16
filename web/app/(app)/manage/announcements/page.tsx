import { Megaphone, Send, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { OrganizerPageShell } from "@/components/app/organizer-shell";
import { AnnouncementForm } from "@/components/app/announcement-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGameDate } from "@/lib/utils";

export default async function ManageAnnouncementsPage() {
  const user = await requireUser();
  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    select: {
      id: true,
      name: true,
      color: true,
      _count: { select: { memberships: true } },
      announcements: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const recent = orgs
    .flatMap((org) =>
      org.announcements.map((announcement) => ({
        ...announcement,
        org: { id: org.id, name: org.name, color: org.color },
      }))
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  return (
    <OrganizerPageShell
      title="Announcements"
      subtitle="Send field changes, reminders and club updates to members without chasing group chats."
      active="/manage/announcements"
      compact
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-field-800 text-gold-300">
              <Send className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-[-0.02em] text-ink">
                Send a club update
              </h2>
              <p className="mt-1 text-sm leading-5 text-ink-2">
                Members receive an alert, and the message appears on the club page.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {orgs.length > 0 ? (
              <AnnouncementForm orgs={orgs.map((org) => ({ id: org.id, name: org.name }))} />
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-ink-2">
                Create a club before sending announcements.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">
              Delivery scope
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.02em] text-ink">
              Who will see it?
            </h2>
            <div className="mt-4 grid gap-3">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: org.color }}
                    />
                    <div>
                      <p className="font-bold text-ink">{org.name}</p>
                      <p className="text-sm text-ink-3">Club members only</p>
                    </div>
                  </div>
                  <Badge tone="info">
                    <Users className="size-3.5" />
                    {org._count.memberships}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">
              Recent announcements
            </p>
            <div className="mt-4 space-y-3">
              {recent.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-2xl border border-line bg-surface-2/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-field-800 text-gold-300">
                      <Megaphone className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-ink">{announcement.title}</p>
                        <Badge tone="neutral">{announcement.org.name}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm leading-5 text-ink-2">
                        {announcement.body}
                      </p>
                      <p className="mt-2 text-xs font-medium text-ink-3">
                        {formatGameDate(announcement.createdAt)} by {announcement.author.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-ink-2">
                  No announcements yet. Send the first update when a field, time or shirt color changes.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </OrganizerPageShell>
  );
}
