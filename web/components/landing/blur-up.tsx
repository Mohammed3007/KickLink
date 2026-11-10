"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLiteMotion, useLiveMotion } from "@/components/glass/use-live-motion";

/**
 * Scroll-scrubbed reveal: rises out of a blur as it enters the viewport.
 * Server HTML is the final state; motion only applies after hydration.
 */
export function BlurUp({
  children,
  className,
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  style?: React.CSSProperties;
}) {
  const live = useLiveMotion();
  const lite = useLiteMotion();
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 62%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const filter = useTransform(scrollYProgress, [0, 1], ["blur(6px)", "blur(0px)"]);
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag ref={ref} className={className} style={live ? { ...style, opacity, y, ...(lite ? {} : { filter }) } : style}>
      {children}
    </Tag>
  );
}
