"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LogOut, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { ADMIN_ITEM, NAV_ITEMS, ORGANIZER_ITEM } from "./nav-items";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
  unread,
  isOrganizer,
  isAdmin,
}: {
  user: { name: string; email: string; avatarColor: string };
  unread: number;
  isOrganizer: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/home" className="px-2">
        <Logo size={30} />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-5">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
              badge={"badgeKey" in item && item.badgeKey === "alerts" ? unread : 0}
            />
          ))}
        </div>

        {isOrganizer && (
          <div className="rounded-2xl border border-gold-400/15 bg-field-950 p-2.5 shadow-[0_18px_45px_-34px_rgba(8,10,9,.9)]">
            <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-300/80">
              <Sparkles className="size-3.5" />
              Organizer
            </div>
            <SidebarItem
              item={ORGANIZER_ITEM}
              pathname={pathname}
              badge={0}
              organizer
            />
            <p className="px-2 pb-1 pt-2 text-xs leading-5 text-white/45">
              Games, rosters, waitlists and payments.
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="space-y-1 border-t border-line pt-4">
            <SidebarItem item={ADMIN_ITEM} pathname={pathname} badge={0} />
          </div>
        )}
      </nav>

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={user.name} color={user.avatarColor} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-bad"
            >
              <LogOut className="size-4.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  pathname,
  badge,
  organizer,
}: {
  item: (typeof NAV_ITEMS)[number] | typeof ORGANIZER_ITEM | typeof ADMIN_ITEM;
  pathname: string;
  badge: number;
  organizer?: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
        organizer
          ? active
            ? "bg-gold-400 text-field-950"
            : "text-white/75 hover:bg-white/8 hover:text-white"
          : active
            ? "text-brand-700"
            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      )}
    >
      {active && !organizer && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 -z-10 rounded-xl bg-brand-50"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <item.icon className="size-5" />
      {item.label}
      {badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-bad px-1.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
