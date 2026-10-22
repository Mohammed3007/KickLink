import { cn } from "@/lib/utils";

/** Two linked rings: the KickLink mark. */
function Rings({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9.3" cy="12" r="5" stroke={color} strokeWidth="2.3" />
      <circle cx="14.7" cy="12" r="5" stroke={color} strokeWidth="2.3" />
    </svg>
  );
}

/**
 * Logo tile. `solid` is the gold-gradient tile used in headers; `subtle` is
 * the outlined tile used on brand panels.
 */
export function LogoMark({
  size = 38,
  variant = "solid",
  className,
}: {
  size?: number;
  variant?: "solid" | "subtle";
  className?: string;
}) {
  const solid = variant === "solid";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        solid
          ? "bg-[linear-gradient(135deg,#f4d78b,#c9952f)] shadow-[0_6px_18px_rgba(231,185,90,0.3)]"
          : "border border-[rgba(231,185,90,0.3)] bg-[rgba(231,185,90,0.16)]",
        className
      )}
      style={{ width: size, height: size, borderRadius: size * 0.29 }}
    >
      <Rings size={size * 0.56} color={solid ? "#1a1304" : "#e7b95a"} />
    </span>
  );
}

export function Wordmark({
  size = 20,
  plain,
  className,
}: {
  size?: number;
  /** Single colour, no gold "Link". */
  plain?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("font-display font-bold tracking-[-0.01em] text-[#f5f3ef]", className)}
      style={{ fontSize: size }}
    >
      Kick<span className={plain ? undefined : "text-brand-600"}>Link</span>
    </span>
  );
}

export function Logo({
  size = 38,
  variant = "solid",
  className,
}: {
  size?: number;
  variant?: "solid" | "subtle";
  /** Kept for older call sites; the logo is always light-on-dark now. */
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)} style={{ gap: size * 0.29 }}>
      <LogoMark size={size} variant={variant} />
      <Wordmark size={size * 0.53} plain={variant === "subtle"} />
    </span>
  );
}
