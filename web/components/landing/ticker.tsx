"use client";

import { useEffect, useRef } from "react";
import { useLiveMotion } from "@/components/glass/use-live-motion";
import { SPORTS } from "./data";

const PROMISES = ["Lineup locked", "Paid before kickoff", "Waitlist on", "No group chat scramble"];

function Group({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <div className="tg" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} style={{ display: "contents" }}>
          <span>{item}</span>
          <span className="sep" />
        </span>
      ))}
    </div>
  );
}

/**
 * Two crossing marquee tapes. Scroll speed speeds them up (up to 6x),
 * reverses them when scrolling up, and skews the bands.
 */
export function Ticker() {
  const live = useLiveMotion();
  const bandA = useRef<HTMLDivElement>(null);
  const bandB = useRef<HTMLDivElement>(null);
  const trackA = useRef<HTMLDivElement>(null);
  const trackB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let vel = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const y = window.scrollY;
      vel += ((y - lastY) / dt - vel) * 0.12;
      lastY = y;
      const speed = Math.min(6, 1 + Math.abs(vel) / 400);
      const dir = vel < -20 ? -1 : 1;
      for (const track of [trackA.current, trackB.current]) {
        track?.getAnimations().forEach((a) => (a.playbackRate = speed * dir));
      }
      const skew = `${Math.max(-10, Math.min(10, vel / 120)).toFixed(2)}deg`;
      bandA.current?.style.setProperty("--skew", skew);
      bandB.current?.style.setProperty("--skew", skew);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <section className="ticker" aria-label="Sports and promises">
      <div className="band b1" ref={bandA}>
        <div className="track" ref={trackA}>
          <Group items={SPORTS} />
          <Group items={SPORTS} hidden />
        </div>
      </div>
      <div className="band b2" ref={bandB}>
        <div className="track" ref={trackB}>
          <Group items={PROMISES} />
          <Group items={PROMISES} hidden />
        </div>
      </div>
    </section>
  );
}
