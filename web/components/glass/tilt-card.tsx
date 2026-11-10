"use client";

import type { ReactNode, PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useLiveMotion } from "./use-live-motion";

const POP = { stiffness: 200, damping: 14 };

/** A glass panel that tilts toward the pointer and springs back on leave. */
export function TiltCard({
  children,
  className,
  maxX = 7,
  maxY = 9,
}: {
  children: ReactNode;
  className?: string;
  maxX?: number;
  maxY?: number;
}) {
  const live = useLiveMotion();
  const rotateX = useSpring(useMotionValue(0), POP);
  const rotateY = useSpring(useMotionValue(0), POP);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * maxX);
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 2 * maxY);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
