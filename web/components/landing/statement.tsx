"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLiteMotion, useLiveMotion } from "@/components/glass/use-live-motion";

const WORDS: [string, string?][] = [
  ["The"], ["group"], ["chat"], ["was", "muted"], ["never", "muted"], ["a", "muted"], ["roster.", "muted"],
  ["KickLink"], ["locks", "hl"], ["the", "hl"], ["lineup,", "hl"], ["takes"], ["the"], ["fee"], ["and"],
  ["fills", "okc"], ["the", "okc"], ["gap.", "okc"],
];

function Word({ text, className, index, progress, live, lite }: { text: string; className?: string; index: number; progress: MotionValue<number>; live: boolean; lite: boolean }) {
  // Each word resolves over its own slice of the paragraph's scroll range.
  const start = (index / WORDS.length) * 0.55;
  const range = [start, start + 0.4];
  const opacity = useTransform(progress, range, [0.12, 1]);
  const filter = useTransform(progress, range, ["blur(8px)", "blur(0px)"]);
  const rotateX = useTransform(progress, range, [-80, 0]);
  const y = useTransform(progress, range, [24, 0]);
  return (
    <motion.span className={className ? `w ${className}` : "w"} style={live ? { opacity, rotateX, y, ...(lite ? {} : { filter }) } : undefined}>
      {text}
    </motion.span>
  );
}

/** "The group chat was never a roster…", resolving word by word on scroll. */
export function Statement() {
  const live = useLiveMotion();
  const lite = useLiteMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 45%"] });
  return (
    <section className="sec">
      <div className="wrap">
        <p className="say" ref={ref}>
          {WORDS.map(([text, cls], i) => (
            <Word key={i} text={text} className={cls} index={i} progress={scrollYProgress} live={live} lite={lite} />
          ))}
        </p>
      </div>
    </section>
  );
}
