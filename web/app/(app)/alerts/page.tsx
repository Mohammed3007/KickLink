import Link from "next/link";
import { Bell, Zap, Clock, Megaphone, ArrowLeftRight, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasOrganizerAccess, requireUser } from "@/lib/session";
import { getNotifications } from "@/lib/queries";
import { OrganizerModePage, PlayerModePage } from "@/components/app/organizer-mode-page";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/app/empty";
import { MarkRead } from "@/components/app/mark-read";
import { timeAgo } from "@/lib/utils";

const ICONS: Record<string, { icon: LucideIcon; tone: string; bg: string }> = {
  OFFER: { icon: Zap, tone: "text-alert", bg: "bg-alert-bg" },
  REMINDER: { icon: Clock, tone: "text-warn", bg: "bg-warn-bg" },
  ANNOUNCE: { icon: Megaphone, tone: "text-brand-600", bg: "bg-brand-50" },
  WAITLIST: { icon: ArrowLeftRight, tone: "text-info", bg: "bg-info-bg" },
  RECEIPT: { icon: Receipt, tone: "text-ok", bg: "bg-ok-bg" },
};

export default async function AlertsPage() {
  const user = await requireUser();
  const [isOrganizer, notifs] = await Promise.all([
    hasOrganizerAccess(user.id).catch(() => false),
    getNotifications(user.id),
  ]);
  const hasUnread = notifs.some((n) => !n.read);

  const content = (
    <>
      <MarkRead hasUnread={hasUnread} />

      <div className="mt-6 space-y-2.5">
        {notifs.length === 0 && (
          <Empty icon={Bell} title="You're all caught up" body="Notifications about your games will show up here." />
        )}
        {notifs.map((n) => {
          const meta =
            isOrganizer && n.kind === "ANNOUNCE"
              ? { icon: Megaphone, tone: "text-gold-300", bg: "bg-field-800" }
              : ICONS[n.kind] ?? ICONS.ANNOUNCE;
          const Inner = (
            <Card className="flex gap-3.5 p-4">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.tone}`}>
                <meta.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{n.title}</p>
                  {!n.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" />
                  )}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{n.body}</p>
                <p className="mt-1 text-xs text-ink-3">{timeAgo(n.createdAt)}</p>
              </div>
            </Card>
          );
          return n.href ? (
            <Link key={n.id} href={n.href} className="block">
              {Inner}
            </Link>
          ) : (
            <div key={n.id}>{Inner}</div>
          );
        })}
      </div>
    </>
  );

  if (isOrganizer) {
    return (
      <OrganizerModePage
        title="Alerts"
        subtitle="Track spot offers, payments, waitlist movement and club announcements."
      >
        {content}
      </OrganizerModePage>
    );
  }

  return (
    <PlayerModePage
      title="Alerts"
      subtitle="Spot offers, receipts, reminders and club announcements land here."
    >
      {content}
    </PlayerModePage>
  );
}
