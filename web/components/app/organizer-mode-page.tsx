import { ShieldCheck } from "lucide-react";

export function OrganizerModePage({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="bg-landing-field relative overflow-hidden rounded-[1.75rem] px-5 py-6 text-white shadow-[0_22px_60px_-44px_rgba(8,10,9,.9)] sm:px-7">
        <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">
              <ShieldCheck className="size-3.5" />
              Organizer view
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#f4efe3] sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c8c4b7] sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </section>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function PlayerModePage({
  title,
  subtitle,
  children,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  if (!title) return <div className="mx-auto max-w-2xl px-5 py-8">{children}</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-[1.6rem] border border-gold-400/15 bg-gradient-to-br from-[#fffdf6] via-white to-[#eef7ef] px-5 py-6 shadow-card sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border border-gold-400/20" />
        <div className="pointer-events-none absolute -right-5 top-10 size-28 rounded-full border border-grass-500/15" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-500">
              Player view
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2 sm:text-base">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </section>
      <div className="mt-6">{children}</div>
    </div>
  );
}
