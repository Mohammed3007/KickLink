import { cn } from "@/lib/utils";

export function DateChip({
  date,
  color = "#6E3BD8",
  className,
}: {
  date: Date;
  color?: string;
  className?: string;
}) {
  const day = new Intl.DateTimeFormat("en-CA", { weekday: "short" })
    .format(date)
    .toUpperCase();
  const num = date.getDate();
  const mon = new Intl.DateTimeFormat("en-CA", { month: "short" })
    .format(date)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-center ring-1 ring-line",
        className
      )}
    >
      <span className="text-[10px] font-bold leading-none" style={{ color }}>
        {day}
      </span>
      <span className="text-xl font-bold leading-tight text-ink">{num}</span>
      <span className="text-[9px] font-semibold leading-none text-ink-3">
        {mon}
      </span>
    </div>
  );
}
