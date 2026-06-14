import { cn } from "@/lib/utils";

export function LogoMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-brand-field",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35)",
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <rect
          x="14" y="22" width="26" height="20" rx="10"
          fill="none" stroke="#fff" strokeWidth="5.5"
        />
        <rect
          x="24" y="22" width="26" height="20" rx="10"
          fill="none" stroke="#fff" strokeWidth="5.5"
        />
      </svg>
    </span>
  );
}

export function Wordmark({
  size = 20,
  light,
  className,
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("font-bold tracking-[-0.03em]", className)}
      style={{ fontSize: size, color: light ? "#fff" : "var(--color-ink)" }}
    >
      Kick
      <span style={{ color: light ? "#fff" : "var(--color-brand-600)" }}>
        Link
      </span>
    </span>
  );
}

export function Logo({
  size = 34,
  light,
  className,
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <Wordmark size={size * 0.62} light={light} />
    </span>
  );
}
