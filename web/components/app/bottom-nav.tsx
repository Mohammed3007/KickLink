"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ORGANIZER_ITEM } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav({
  unread,
  isOrganizer,
}: {
  unread: number;
  isOrganizer?: boolean;
}) {
  const pathname = usePathname();
  const items = isOrganizer
    ? [...NAV_ITEMS.filter((item) => item.href !== "/profile"), ORGANIZER_ITEM]
    : NAV_ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
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
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-medium transition-colors",
                active
                  ? isOrganizer && item.href === "/manage"
                    ? "text-gold-500"
                    : "text-brand-600"
                  : "text-ink-3"
              )}
            >
              <span className="relative">
                <item.icon className="size-6" strokeWidth={active ? 2.3 : 1.9} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
