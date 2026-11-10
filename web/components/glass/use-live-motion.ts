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

const LITE_QUERY = "(max-width: 860px), (pointer: coarse)";

/**
 * True on phones and touch devices (same query as the lite block in
 * app/glass.css). Scroll effects there skip blur filters, which mobile GPUs
 * re-rasterise every frame.
 */
export function useLiteMotion() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(LITE_QUERY);
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return lite;
}
