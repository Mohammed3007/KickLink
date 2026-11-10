"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLiveMotion } from "@/components/glass/use-live-motion";

const STEPS = [
  { title: "Join your club", body: "Players sign up, complete their profile and join the organizations they actually play with." },
  { title: "Claim a spot", body: "Browse eligible games, see the details, pay if needed and get a confirmed registration." },
  { title: "Show up and play", body: "Organizers see the roster, record attendance and keep club history accurate after the game." },
];

// Front-facing opacity for each face across the ring's turn (0..1).
const FACE_OPACITY: [number[], number[]][] = [
  [[0, 0.15, 0.45, 1], [1, 1, 0.2, 0.2]],
  [[0, 0.35, 0.65, 1], [0.2, 1, 1, 0.2]],
  [[0, 0.55, 0.85, 1], [0.2, 0.2, 1, 1]],
];

function Face({ i, turn, live }: { i: number; turn: MotionValue<number>; live: boolean }) {
  const [at, values] = FACE_OPACITY[i];
  const opacity = useTransform(turn, at, values);
  const step = STEPS[i];
  return (
    <motion.article
      className="face"
      style={live ? { opacity } : undefined}
      transformTemplate={live ? () => `rotateY(${i * 72}deg) translateZ(380px)` : undefined}
    >
      <div className="num ext">0{i + 1}</div>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </motion.article>
  );
}

/**
 * The three steps on a 3D cylinder that turns as the pinned section scrolls.
 * Without motion it's a plain stack of cards.
 */
export function StepRing() {
  const live = useLiveMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const turn = useTransform(scrollYProgress, [0.1, 0.9], [0, 1], { clamp: true });
  const rotateY = useTransform(turn, [0, 1], [0, -144]);

  return (
    <section className={live ? "ringsec live" : "ringsec"} id="how" aria-label="How it works" ref={ref}>
      <div className="rstage">
        <div className="wrap rgrid">
          <div>
            <span className="eyebrow">Game day flow</span>
            <h2 className="title">
              From invite to attendance in <span className="ext">three steps.</span>
            </h2>
            <p className="lede">
              Players get a fast path to a confirmed spot. Organizers get a clean record after the whistle.
            </p>
          </div>
          <div className="rscene">
            <motion.div className="kl-ring" style={live ? { z: -380, rotateY } : undefined}>
              {STEPS.map((_, i) => (
                <Face key={i} i={i} turn={turn} live={live} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
