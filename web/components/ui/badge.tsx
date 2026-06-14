import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "ok" | "warn" | "info" | "alert" | "bad" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  info: "bg-info-bg text-info",
  alert: "bg-alert-bg text-alert",
  bad: "bg-bad-bg text-bad",
  neutral: "bg-surface-2 text-ink-2",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-[-0.01em]",
        tones[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ── Domain status → badge ────────────────────────────────────────
const REG_TONE: Record<string, { tone: Tone; label: string }> = {
  CONFIRMED: { tone: "ok", label: "Confirmed" },
  PROVISIONAL: { tone: "warn", label: "Provisional" },
  WAITLISTED: { tone: "info", label: "Waitlisted" },
  OFFERED: { tone: "alert", label: "Spot offered" },
  CANCELLED: { tone: "bad", label: "Cancelled" },
};

const PAY_TONE: Record<string, { tone: Tone; label: string }> = {
  PAID: { tone: "ok", label: "Paid" },
  UNPAID: { tone: "warn", label: "Unpaid" },
  FREE: { tone: "ok", label: "Free" },
  REFUNDED: { tone: "neutral", label: "Refunded" },
};

export function RegBadge({ status }: { status: string }) {
  const s = REG_TONE[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function PayBadge({ status }: { status: string }) {
  const s = PAY_TONE[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}
