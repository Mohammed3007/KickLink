import { cn, formatDateChipParts } from "@/lib/utils";

export function DateChip({
  date,
  color = "#6E3BD8",
  className,
}: {
  date: Date;
  color?: string;
  className?: string;
}) {
  const { weekday, day, month } = formatDateChipParts(date);

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-center ring-1 ring-line",
        className
      )}
    >
      <span className="text-[10px] font-bold leading-none" style={{ color }}>
        {weekday}
      </span>
      <span className="text-xl font-bold leading-tight text-ink">{day}</span>
      <span className="text-[9px] font-semibold leading-none text-ink-3">
        {month}
      </span>
    </div>
  );
}
