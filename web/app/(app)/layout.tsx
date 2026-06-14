import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { MobileHeader } from "@/components/app/mobile-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [unread, orgRole] = await Promise.all([
    getUnreadCount(user.id),
    db.membership.findFirst({
      where: { userId: user.id, role: "ORGANIZER" },
      select: { id: true },
    }),
  ]);
  const isOrganizer = !!orgRole;

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        user={{ name: user.name, email: user.email, avatarColor: user.avatarColor }}
        unread={unread}
        isOrganizer={isOrganizer}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader user={{ name: user.name, avatarColor: user.avatarColor }} />
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <BottomNav unread={unread} />
      </div>
    </div>
  );
}
