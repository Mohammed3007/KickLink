import { avatarColor, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = 38,
  className,
  ring,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const bg = color || avatarColor(name);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        ring && "ring-2 ring-surface",
        className
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** Overlapping avatar stack for rosters. */
export function AvatarStack({
  names,
  max = 5,
  size = 30,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <span
          key={i}
          style={{ marginLeft: i === 0 ? 0 : -size * 0.32, zIndex: max - i }}
        >
          <Avatar name={n} size={size} ring />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2 ring-2 ring-surface"
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.32,
            fontSize: size * 0.34,
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
