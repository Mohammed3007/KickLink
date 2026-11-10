"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useLiteMotion, useLiveMotion } from "./use-live-motion";

/**
 * Drifting gold and pitch-green glows, plus a gold spotlight that follows the
 * pointer on a spring (hover-capable devices only; CSS hides it on touch).
 */
export function GlassBackdrop({ fixed = false, glows = 4 }: { fixed?: boolean; glows?: 3 | 4 }) {
  const live = useLiveMotion();
  const lite = useLiteMotion();
  const [seen, setSeen] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 16 });
  const sy = useSpring(y, { stiffness: 120, damping: 16 });

  useEffect(() => {
    if (!live || lite) return;
    x.jump(window.innerWidth / 2 - 360);
    y.jump(window.innerHeight / 3 - 360);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX - 360);
      y.set(e.clientY - 360);
      setSeen(true);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [live, lite, x, y]);

  return (
    <>
      <div className={fixed ? "glows fixed" : "glows"} aria-hidden="true">
        <div className="g g1" />
        <div className="g g2" />
        <div className="g g3" />
        {glows === 4 && <div className="g g4" />}
      </div>
      {live && !lite && <motion.div className={seen ? "spot on" : "spot"} style={{ x: sx, y: sy }} aria-hidden="true" />}
    </>
  );
}
