import {
  ShieldCheck,
  Receipt,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getProfileData } from "@/lib/queries";
import { db } from "@/lib/db";
import { SectionLabel } from "@/components/app/page-header";
import { PlayerModePage } from "@/components/app/organizer-mode-page";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/app/profile-form";
import { NotificationPreferences } from "@/components/app/notification-preferences";
import { logout } from "@/lib/actions/auth";
import { formatPrice } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const { attended, payments, clubCount } = await getProfileData(user.id);
  const isOrganizer = !!(await db.membership.findFirst({
    where: { userId: user.id, role: "ORGANIZER" },
    select: { id: true },
  }));

  return (
    <PlayerModePage
      title="Profile"
      subtitle="Your player identity, receipts, notification preferences and account tools."
    >
      {/* Identity */}
      <Card className="mt-5 p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} color={user.avatarColor} size={60} />
          <div>
            <h2 className="text-xl font-bold text-ink">{user.name}</h2>
            <p className="text-sm text-ink-3">
              {user.skill} · {user.city}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-ok-bg px-3.5 py-3 text-ok">
          <ShieldCheck className="size-5" />
          <div className="text-sm">
            <span className="font-semibold">Good standing</span>
            <span className="text-ok/80">
              {" "}
              · {attended} games · {clubCount} clubs
            </span>
          </div>
        </div>
      </Card>

      <SectionLabel>Edit profile</SectionLabel>
      <Card className="p-5">
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            city: user.city,
            skill: user.skill,
            avatarColor: user.avatarColor,
          }}
        />
      </Card>

      {/* Recent receipts */}
      {payments.length > 0 && (
        <>
          <SectionLabel>Payments &amp; receipts</SectionLabel>
          <Card className="divide-y divide-line-2">
            {payments.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/games/${p.gameId}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-ink-3">
                  <Receipt className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.game.title}
                  </p>
                  <p className="text-xs text-ink-3">{p.method}</p>
                </div>
                <span
                  className={
                    "text-sm font-semibold " +
                    (p.status === "REFUNDED" ? "text-ink-3 line-through" : "text-ink")
                  }
                >
                  {formatPrice(p.amountCents)}
                </span>
              </Link>
            ))}
          </Card>
        </>
      )}

      <SectionLabel>Notification preferences</SectionLabel>
      <NotificationPreferences />

      {/* Organizer CTA */}
      <div className="mt-4">
        {isOrganizer ? (
          <Link href="/manage">
            <Button full size="lg" variant="secondary">
              <LayoutDashboard className="size-5" /> Go to organizer dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/manage/clubs/new">
            <div className="bg-brand-field flex items-center gap-3 rounded-2xl p-4 text-white shadow-brand">
              <LayoutDashboard className="size-6" />
              <div className="flex-1">
                <p className="font-semibold">Run your own games</p>
                <p className="text-sm text-white/80">
                  Create a club and start organizing
                </p>
              </div>
              <ChevronRight className="size-5" />
            </div>
          </Link>
        )}
      </div>

      <form action={logout} className="mt-4">
        <Button full size="lg" variant="ghost" className="text-bad hover:bg-bad-bg">
          <LogOut className="size-5" /> Sign out
        </Button>
      </form>
    </PlayerModePage>
  );
}
