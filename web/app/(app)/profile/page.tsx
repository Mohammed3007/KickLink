import {
  ShieldCheck,
  Receipt,
  History,
  Bell,
  Lock,
  HelpCircle,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getProfileData } from "@/lib/queries";
import { db } from "@/lib/db";
import { PageHeader, SectionLabel } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-2xl px-5 py-8">
      <PageHeader title="Profile" />

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

      {/* Recent receipts */}
      {payments.length > 0 && (
        <>
          <SectionLabel>Payments &amp; receipts</SectionLabel>
          <Card className="divide-y divide-line-2">
            {payments.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
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
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Menu */}
      <SectionLabel>Settings</SectionLabel>
      <Card className="divide-y divide-line-2">
        <MenuItem icon={History} label="Game history" />
        <MenuItem icon={Bell} label="Notification preferences" />
        <MenuItem icon={Lock} label="Privacy & visibility" />
        <MenuItem icon={HelpCircle} label="Help & support" />
      </Card>

      {/* Organizer CTA */}
      <div className="mt-4">
        {isOrganizer ? (
          <Link href="/manage">
            <Button full size="lg" variant="secondary">
              <LayoutDashboard className="size-5" /> Go to organizer dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/manage">
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
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        <Icon className="size-4.5" />
      </span>
      <span className="flex-1 font-medium text-ink">{label}</span>
      <ChevronRight className="size-5 text-ink-3" />
    </button>
  );
}
