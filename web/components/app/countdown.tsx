"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Live MM:SS countdown to a target time. */
export function Countdown({
  to,
  className,
  onExpire,
}: {
  to: string | Date;
  className?: string;
  onExpire?: () => void;
}) {
  const target = new Date(to).getTime();
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.floor((target - Date.now()) / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setLeft(next);
      if (next <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  return (
    <span
      suppressHydrationWarning
      className={cn("tabular-nums font-bold", className)}
    >
      {fmt(left)}
    </span>
  );
}
