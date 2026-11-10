"use client";

import Link from "next/link";
import type { ComponentProps, PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useLiveMotion } from "./use-live-motion";

// Springy settle that overshoots a little, like the design's spring-pop curve.
const POP = { stiffness: 260, damping: 13, mass: 0.9 };
const MotionLink = motion.create(Link);

/** Pointer-follow offset shared by the magnetic link and button. */
function useMagnet() {
  const live = useLiveMotion();
  const x = useSpring(useMotionValue(0), POP);
  const y = useSpring(useMotionValue(0), POP);
  const rotate = useSpring(useMotionValue(0), POP);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    x.set(dx * 14);
    y.set(dy * 10);
    rotate.set(dx * 4);
  };
  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
    rotate.set(0);
  };
  return {
    style: { x, y, rotate },
    onPointerMove,
    onPointerLeave,
    whileTap: live ? { scale: 0.92 } : undefined,
  };
}

/** A link that leans toward the pointer and springs back. */
export function MagneticLink(
  props: Omit<ComponentProps<typeof Link>, "style" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">
) {
  const magnet = useMagnet();
  return <MotionLink {...props} {...magnet} />;
}

/** A button that leans toward the pointer and springs back. */
export function MagneticButton(
  props: Omit<ComponentProps<"button">, "style" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">
) {
  const magnet = useMagnet();
  return <motion.button {...props} {...magnet} />;
}
