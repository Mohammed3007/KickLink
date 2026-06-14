import { Home, CalendarDays, Users, Bell, User, LayoutDashboard } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/games", label: "Games", icon: CalendarDays },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell, badgeKey: "alerts" as const },
  { href: "/profile", label: "Profile", icon: User },
];

export const ORGANIZER_ITEM = {
  href: "/manage",
  label: "Manage",
  icon: LayoutDashboard,
};
