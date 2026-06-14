"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { NAV_ITEMS, ORGANIZER_ITEM } from "./nav-items";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
  unread,
  isOrganizer,
}: {
  user: { name: string; email: string; avatarColor: string };
  unread: number;
  isOrganizer: boolean;
}) {
  const pathname = usePathname();
  const items = isOrganizer ? [...NAV_ITEMS, ORGANIZER_ITEM] : NAV_ITEMS;

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/home" className="px-2">
        <Logo size={30} />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const badge =
            "badgeKey" in item && item.badgeKey === "alerts" ? unread : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                active ? "text-brand-700" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              )}
            >
              {active && (
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
        })}
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
