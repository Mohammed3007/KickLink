import Link from "next/link";
import { cn } from "@/lib/utils";

export function Segment({
  options,
  active,
}: {
  options: { value: string; label: string; href: string }[];
  active: string;
}) {
  return (
    <div className="inline-flex rounded-xl bg-surface-2 p-1">
      {options.map((o) => (
        <Link
          key={o.value}
          href={o.href}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors",
            active === o.value
              ? "bg-surface text-ink shadow-card"
              : "text-ink-2 hover:text-ink"
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
