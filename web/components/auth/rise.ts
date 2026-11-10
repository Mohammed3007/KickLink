import type { CSSProperties } from "react";

/** Entrance-stagger props for an element rising in `delay` seconds after load. */
export function rise(delay: number): { className: string; style: CSSProperties } {
  return { className: "rise", style: { "--d": `${Math.round(delay * 1000)}ms` } as CSSProperties };
}
