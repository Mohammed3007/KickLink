"use client";

import { useEffect, useRef } from "react";
import { useLiteMotion, useLiveMotion } from "@/components/glass/use-live-motion";
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
 * reverses them when scrolling up, and skews the bands (not on phones).
 */
export function Ticker() {
  const live = useLiveMotion();
  const lite = useLiteMotion();
  const section = useRef<HTMLElement>(null);
  const bandA = useRef<HTMLDivElement>(null);
  const bandB = useRef<HTMLDivElement>(null);
  const trackA = useRef<HTMLDivElement>(null);
  const trackB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live || !section.current) return;
    let raf = 0;
    let last = 0;
    let lastY = 0;
    let vel = 0;
    let rate = 1;
    let skew = "";
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const y = window.scrollY;
      vel += ((y - lastY) / dt - vel) * 0.12;
      lastY = y;
      // Only touch the animations and styles when the value actually changes.
      const next = Math.round(Math.min(6, 1 + Math.abs(vel) / 400) * (vel < -20 ? -1 : 1) * 20) / 20;
      if (next !== rate) {
        rate = next;
        for (const track of [trackA.current, trackB.current]) {
          track?.getAnimations().forEach((a) => (a.playbackRate = rate));
        }
      }
      // Skewing the bands re-rasterises their big type, so phones skip it.
      if (!lite) {
        const s = `${Math.max(-10, Math.min(10, vel / 120)).toFixed(1)}deg`;
        if (s !== skew) {
          skew = s;
          bandA.current?.style.setProperty("--skew", s);
          bandB.current?.style.setProperty("--skew", s);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    // Run only while the ticker is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (!entry.isIntersecting) return;
      last = performance.now();
      lastY = window.scrollY;
      raf = requestAnimationFrame(tick);
    });
    io.observe(section.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [live, lite]);

  return (
    <section className="ticker" aria-label="Sports and promises" ref={section}>
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
