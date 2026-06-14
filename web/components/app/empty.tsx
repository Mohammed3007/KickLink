import type { LucideIcon } from "lucide-react";

export function Empty({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-3">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-xs text-sm text-ink-2">{body}</p>}
    </div>
  );
}
