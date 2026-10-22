import type { CSSProperties } from "react";

/** Entrance-stagger props for an element appearing `delay` seconds in. */
export function rise(delay: number): { className: string; style: CSSProperties } {
  return { className: "animate-rise", style: { animationDelay: `${delay}s` } };
}
