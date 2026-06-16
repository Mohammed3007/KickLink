import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, LayoutDashboard, Megaphone, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ORGANIZER_TABS = [
  { href: "/manage", label: "Command", icon: LayoutDashboard },
  { href: "/manage/games/new", label: "New game", icon: CalendarDays },
  { href: "/manage/announcements", label: "Announcements", icon: Megaphone },
  { href: "/manage/finances", label: "Finances", icon: CreditCard },
];

export function OrganizerPageShell({
  title,
  subtitle,
  eyebrow = "Organizer workspace",
  children,
  action,
  backHref,
  active = "/manage",
  compact,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  active?: string;
  compact?: boolean;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="bg-landing-field relative overflow-hidden rounded-[1.75rem] px-5 py-6 text-white shadow-[0_26px_70px_-42px_rgba(8,10,9,.9)] sm:px-7">
        <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className={compact ? "max-w-2xl" : "max-w-3xl"}>
            {backHref && (
              <Link
                href={backHref}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/62 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back
              </Link>
            )}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">
              <ShieldCheck className="size-3.5" />
              {eyebrow}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#f4efe3] sm:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c8c4b7] sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex flex-wrap gap-3">{action}</div>}
        </div>

        <div className="relative mt-6 flex gap-2 overflow-x-auto pb-1">
          {ORGANIZER_TABS.map((tab) => {
            const isActive = active === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-gold-400 text-field-950"
                    : "border border-white/10 bg-white/7 text-white/68 hover:bg-white/12 hover:text-white"
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export function OrganizerPrimaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Button className="bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-none hover:brightness-105">
        <Plus className="size-4" />
        {children}
      </Button>
    </Link>
  );
}
