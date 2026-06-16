import { requireUser } from "@/lib/session";
import { DatabaseUnavailableError } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { MobileHeader } from "@/components/app/mobile-header";
import { Card } from "@/components/ui/card";
import { isPlatformAdminUser } from "@/lib/admin";
import { cn } from "@/lib/utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return <DatabaseSetupMessage />;
    }
    throw error;
  }

  const [unread, orgRole] = await Promise.all([
    getUnreadCount(user.id).catch(() => 0),
    db.membership
      .findFirst({
        where: { userId: user.id, role: "ORGANIZER" },
        select: { id: true },
      })
      .catch(() => null),
  ]);
  const isOrganizer = !!orgRole;
  const isAdmin = isPlatformAdminUser(user);

  return (
    <div className={cn("flex min-h-dvh", isOrganizer ? "bg-[#f2f1ec]" : "bg-[#f8f7f1]")}>
      <Sidebar
        user={{ name: user.name, email: user.email, avatarColor: user.avatarColor }}
        unread={unread}
        isOrganizer={isOrganizer}
        isAdmin={isAdmin}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader
          user={{ name: user.name, avatarColor: user.avatarColor }}
          isOrganizer={isOrganizer}
        />
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <BottomNav unread={unread} isOrganizer={isOrganizer} />
      </div>
    </div>
  );
}

function DatabaseSetupMessage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-5">
      <Card className="max-w-lg p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
          Deployment setup needed
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">KickLink cannot reach the database</h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">
          The app is deployed, but the production database connection or migrations are not ready.
          Set `DATABASE_URL` in Vercel and run `npm run db:deploy` from the `web` folder against
          that database.
        </p>
      </Card>
    </main>
  );
}
