import Link from "next/link";

/** Two interlocking gold rings + the wide KICKLINK wordmark. */
export function GlassLogo({ href = "/", animated = false }: { href?: string; animated?: boolean }) {
  return (
    <Link className="logo" href={href} aria-label="KickLink home">
      <svg
        className={animated ? "rings-link" : undefined}
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        aria-hidden="true"
      >
        <circle className="r1" cx="12" cy="16" r="7.5" />
        <circle className="r2" cx="20" cy="16" r="7.5" />
      </svg>
      <span>KickLink</span>
    </Link>
  );
}
