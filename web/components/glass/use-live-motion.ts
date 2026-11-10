"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * True once the page has hydrated and the visitor hasn't asked for reduced
 * motion. Scroll-linked effects only switch on then, so the server-rendered
 * HTML (and the page with JavaScript off) shows every final state.
 */
export function useLiveMotion() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- flips once after hydration
  useEffect(() => setMounted(true), []);
  return mounted && !reduced;
}
