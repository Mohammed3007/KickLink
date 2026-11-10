"use client";

import Link from "next/link";
import { useRef } from "react";
import { cubicBezier, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { GlassLogo } from "@/components/glass/logo";
import { useLiveMotion } from "@/components/glass/use-live-motion";

const POP = cubicBezier(0.34, 1.56, 0.64, 1);
const LETTERS = "KICKLINK".split("");

function Letter({ ch, i, progress, live }: { ch: string; i: number; progress: MotionValue<number>; live: boolean }) {
  // This letter's own 0..1 slice of the footer's entrance, eased with overshoot.
  const t = useTransform(progress, [0.2 + i * 0.05, 0.6 + i * 0.05], [0, 1]);
  const eased = useTransform(t, (v) => POP(v));
  const y = useTransform(eased, (v) => `${(1 - v) * 70}%`);
  const rotateX = useTransform(eased, (v) => (1 - v) * -110);
  const rotateZ = useTransform(eased, (v) => (1 - v) * -8);
  const opacity = useTransform(t, (v) => Math.min(1, v * 1.6));
  return (
    <motion.span className="fl" style={live ? { y, rotateX, rotateZ, opacity } : undefined}>
      {ch}
    </motion.span>
  );
}

/** Footer with the giant extruded wordmark whose letters tumble in. */
export function LandingFooter() {
  const live = useLiveMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  return (
    <footer className="footer" ref={ref}>
      <div className="wrap">
        <div className="ftop">
          <GlassLogo href="#top" />
          <nav className="flinks" aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#clubs">For organizers</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        <div className="mark" aria-hidden="true">
          {LETTERS.map((ch, i) => (
            <Letter key={i} ch={ch} i={i} progress={scrollYProgress} live={live} />
          ))}
        </div>
        <div className="fbot">
          <span>© 2026 KickLink</span>
          <span>Ottawa, ON</span>
        </div>
      </div>
    </footer>
  );
}
