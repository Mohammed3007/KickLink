"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "motion";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useLiveMotion } from "@/components/glass/use-live-motion";
import { HERO_SLOTS, JERSEYS } from "./data";

// Scene geometry (px on the 760×460 pitch) and timeline data from the design
// reference. The markup below is the story's final state: the full lineup,
// lights on, LINEUP LOCKED. The scroll-scrubbed timeline only sets the
// starting states, so the section reads fine without JavaScript.
const SLOTS = HERO_SLOTS.map(([x, y]) => ({ x: +(x * 7.6).toFixed(1), y: +(y * 4.6).toFixed(1) }));
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5], [3, 6], [4, 6], [5, 6]];
const LINES = [0, 7].flatMap((off) =>
  EDGES.map(([a, b]) => ({
    cls: off ? "eb" : "ea",
    d: `M${SLOTS[a + off].x} ${SLOTS[a + off].y} L${SLOTS[b + off].x} ${SLOTS[b + off].y}`,
  }))
);
const SPARKS = Array.from({ length: 22 }, (_, i) => {
  const ang = (i / 22) * Math.PI * 2 + (i % 2) * 0.12;
  const r = 150 + (i % 4) * 55;
  return {
    dx: Math.round(Math.cos(ang) * r * 1.5),
    dy: Math.round(Math.sin(ang) * r * 0.75),
    cls: `spark${i % 3 === 0 ? " g" : ""}${i % 2 ? " s" : ""}`,
  };
});
const LIGHTS: [number, number][] = [[-34, -34], [794, -34], [-34, 494], [794, 494]];
const POOLS: [number, number][] = [[0, 0], [760, 0], [0, 460], [760, 460]];
const OPEN_SLOT = SLOTS[10];
const CAPTIONS = [
  { n: "01 / Post", title: <>Post the game.</>, body: "Sunday Night 7s, Brewer Park Turf, $12 a spot. One link to the club and the pitch opens up." },
  { n: "02 / Claim", title: <>Players claim <span className="hl">and pay.</span></>, body: "Every spot locks the moment the fee clears. No chasing payments in the group chat." },
  { n: "03 / Swap", title: <>Someone drops. <span className="okc">The waitlist moves up.</span></>, body: "The next player gets the offer automatically. You never rebuild the lineup." },
  { n: "04 / Lock", title: <span className="ext">Lineup locked.</span>, body: "Fourteen confirmed and fees collected, with nothing left to chase before kickoff." },
];
const STEPS = ["Post", "Claim", "Swap", "Lock"];
const TIMELINE = 10;
const PRICE = 12;

type Controls = ReturnType<typeof animate>;
// Motion sequence segments: [element(s), keyframes, options].
type Segment = [Element | Element[], Record<string, unknown>, Record<string, unknown>];

function buildTimeline(story: HTMLElement) {
  const q = (s: string) => story.querySelector(s) as HTMLElement;
  const qa = (s: string) => Array.from(story.querySelectorAll<HTMLElement>(s));
  const seq: Segment[] = [];
  const add = (el: Element | Element[] | null, kf: Record<string, unknown>, at: number, duration: number, ease: unknown = [0.2, 0.8, 0.2, 1], extra: Record<string, unknown> = {}) => {
    if (!el || (Array.isArray(el) && !el.length)) return;
    seq.push([el, kf, { at, duration, ease, ...extra }]);
  };
  const T = (x: number, y: number, z: number, r = 0) => `translate3d(${x}px,${y}px,${z}px) rotateZ(${r}deg)`;
  const parts = (el: Element) => Array.from(el.querySelectorAll(".sp-head,.sp-stem,.sp-foot"));
  const inOut = [0.65, 0, 0.35, 1];
  const pop = [0.34, 1.56, 0.64, 1];
  const plane = q(".sp-plane");
  const caps = qa(".cap2");
  const pins = qa(".sp-tok.pl");
  const rips = qa(".sp-rip");
  const bench = qa(".sp-tok.bench-tok");
  const capOut = { opacity: [1, 0], y: [0, -40], filter: ["blur(0px)", "blur(8px)"] };
  const capIn = { opacity: [0, 1], y: [40, 0], filter: ["blur(8px)", "blur(0px)"] };
  const landing: number[] = [];

  // Act 1: the game card spins in, gets posted, then flips down into the pitch.
  add(plane, { "--tilt": ["12deg", "0deg"], "--spinY": ["-26deg", "0deg"], "--yaw": ["4deg", "0deg"], "--sc": [0.5, 0.58] }, 0, 1.0, inOut);
  add(q(".post"), { opacity: [1, 1] }, 0, 0.01);
  add(q(".pb-b"), { opacity: [0, 1] }, 1.0, 0.25);
  add(q(".postbtn"), { scale: [1, 0.94, 1] }, 0.95, 0.35);
  add(plane, { "--tilt": ["0deg", "58deg"], "--yaw": ["0deg", "-14deg"], "--sc": [0.58, 1] }, 1.4, 1.2, inOut);
  add(q(".post"), { opacity: [1, 0] }, 1.75, 0.45);
  add(qa(".sp-slot"), { opacity: [0, 1] }, 2.1, 0.3, "linear", { delay: stagger(0.02) });
  add(caps[0], capOut, 2.3, 0.35);

  // Act 2: fourteen players rain in, each landing pays $12.
  add(caps[1], capIn, 2.6, 0.35);
  pins.forEach((p, i) => {
    const t = 2.7 + i * 0.16;
    add(p, { transform: [T(0, 0, 460), T(0, 0, 0), T(0, 0, 26), T(0, 0, 0)] }, t, 0.5, "linear", { times: [0, 0.62, 0.8, 1] });
    add(parts(p), { opacity: [0, 1] }, t, 0.12, "linear");
    add(rips[i], { opacity: [0, 0.95, 0], scale: [0.3, 1.6, 2.8] }, t + 0.3, 0.55);
    add(p.querySelector(".sp-cash span"), { opacity: [0, 1, 1, 0], y: [8, -26, -40, -58] }, t + 0.3, 0.8, "linear");
    landing.push(t + 0.31);
  });
  add(caps[1], capOut, 5.1, 0.35);

  // Act 3: camera swings, #6 drops out, the waitlist hops in.
  add(caps[2], capIn, 5.4, 0.35);
  add(plane, { "--yaw": ["-14deg", "16deg"], "--tilt": ["58deg", "46deg"], "--sc": [1, 0.92] }, 5.35, 1.0, inOut);
  const benchFrom: [number, number][] = [[-197.6, 290], [60.8, 0], [60.8, 0]];
  bench.forEach((b, i) => {
    const [x, y] = benchFrom[i];
    const t = 5.55 + i * 0.1;
    add(b, { transform: [T(x, y, 260), T(x, y, 0), T(x, y, 18), T(x, y, 0)] }, t, 0.45, "linear", { times: [0, 0.62, 0.8, 1] });
    add(parts(b), { opacity: [0, 1] }, t, 0.12, "linear");
  });
  const out = pins[10];
  add(out, { transform: [T(0, 0, 0), T(30, -10, 90, 10), T(190, -110, 600, 80)] }, 6.0, 0.8, [0.5, 0, 0.9, 0.5]);
  add(parts(out), { opacity: [1, 0] }, 6.35, 0.4, "linear");
  add(q(".sp-open"), { opacity: [0, 1, 1, 1, 0], scale: [0.4, 1, 1.25, 1, 1.6] }, 6.3, 1.3, "linear");
  const hop = bench[0];
  add(hop, { transform: [T(-197.6, 290, 0), T(-148, 218, 150), T(-99, 145, 230), T(-49, 72, 150), T(0, 0, 0), T(0, 0, 20), T(0, 0, 0)] }, 6.8, 0.85, "linear", { times: [0, 0.18, 0.36, 0.54, 0.74, 0.87, 1] });
  add(rips[10], { opacity: [0, 0.95, 0], scale: [0.3, 1.6, 2.8] }, 7.45, 0.55);
  add(hop.querySelector(".sp-cash span"), { opacity: [0, 1, 1, 0], y: [8, -26, -40, -58] }, 7.45, 0.8, "linear");
  add(bench[1], { transform: [T(60.8, 0, 0), T(30, 0, 30), T(0, 0, 0)] }, 7.55, 0.4, inOut);
  add(bench[2], { transform: [T(60.8, 0, 0), T(30, 0, 30), T(0, 0, 0)] }, 7.62, 0.4, inOut);
  add(caps[2], capOut, 7.6, 0.35);

  // Act 4: the lineup locks: links draw, light sweeps, stamp slams, sparks burst.
  add(caps[3], capIn, 7.9, 0.35);
  add(plane, { "--yaw": ["16deg", "-6deg"], "--tilt": ["46deg", "56deg"], "--sc": [0.92, 1.04] }, 7.7, 1.3, inOut);
  add(qa(".sp-lines path"), { strokeDashoffset: [1, 0] }, 8.0, 0.5, [0.2, 0.8, 0.2, 1], { delay: stagger(0.025) });
  add(q(".sweep"), { x: [-220, 780], opacity: [0, 1, 1, 0] }, 8.15, 0.9, "linear");
  add(rips, { opacity: [0, 0.9, 0], scale: [0.3, 1.8, 3] }, 8.6, 0.55, [0.2, 0.8, 0.2, 1], { delay: stagger(0.025) });
  const stamp = q(".stamp");
  add(stamp, { opacity: [0, 1], scale: [2.6, 1], rotate: [-18, -6] }, 8.9, 0.55, pop);
  add(stamp, { filter: ["blur(16px)", "blur(0px)"] }, 8.9, 0.4);
  qa(".spark").forEach((s) => {
    const dx = Number(s.dataset.dx) || 0;
    const dy = Number(s.dataset.dy) || 0;
    add(s, { opacity: [0, 1, 1, 0], x: [0, dx * 0.7, dx * 0.95, dx], y: [0, dy * 0.7, dy * 0.95, dy + 30], scale: [0.4, 1.3, 1, 0.3] }, 9.05, 0.9, "linear");
  });
  add(q(".sready"), { opacity: [0, 1], y: [24, 0], scale: [0.8, 1] }, 9.3, 0.5, pop);
  add(plane, { "--sc": [1.04, 1.04] }, 9.95, 0.05, "linear");

  // Floodlights: towers appear as the card becomes a pitch, then power on
  // corner by corner, falter when a player drops, and strobe at the lock.
  const glows = qa(".fl-glow");
  const pools = qa(".fl-pool");
  const bulbs = qa(".fl-bulbs");
  const bursts = qa(".fl-burst");
  add(qa(".fl-pole,.fl-head"), { opacity: [0, 1] }, 2.1, 0.3, "linear");
  [0, 1, 3, 2].forEach((k, n) => {
    const t = 2.4 + n * 0.2;
    add(bulbs[k], { opacity: [0.25, 1, 0.35, 1, 0.6, 1] }, t, 0.5, "linear");
    add(glows[k], { opacity: [0, 1, 0.15, 1, 0.5, 1] }, t, 0.5, "linear");
    add(pools[k], { opacity: [0, 0.9, 0.1, 0.9, 0.45, 0.9] }, t + 0.04, 0.5, "linear");
  });
  add(glows, { opacity: [1, 0.3, 0.75, 0.25, 0.35] }, 5.95, 0.6, "linear");
  add(pools, { opacity: [0.9, 0.25, 0.6, 0.2, 0.25] }, 5.95, 0.6, "linear");
  add(bulbs, { opacity: [1, 0.45, 0.8, 0.4, 0.5] }, 5.95, 0.6, "linear");
  add(glows, { opacity: [0.35, 1, 0.7, 1] }, 7.45, 0.3, "linear");
  add(pools, { opacity: [0.25, 0.9, 0.6, 0.9] }, 7.45, 0.3, "linear");
  add(bulbs, { opacity: [0.5, 1, 0.8, 1] }, 7.45, 0.3, "linear");
  [[0, 2], [1, 3]].forEach((pair, n) => {
    add(pair.map((k) => bursts[k]), { opacity: [0, 0.85, 0], scale: [0.6, 1, 1.2] }, 8.15 + n * 0.45, 0.35, "linear");
  });
  add(bursts, { opacity: [0, 1, 0.1, 1, 0.1, 0.9, 0], scale: [0.7, 1.1, 1, 1.15, 1, 1.2, 1.3] }, 8.88, 0.6, "linear");
  add(glows, { opacity: [1, 0.2, 1, 0.2, 1, 1] }, 8.88, 0.6, "linear");
  add(q(".sflash"), { opacity: [0, 0.6, 0, 0.45, 0, 0.25, 0] }, 8.88, 0.65, "linear");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Motion's sequence types don't model CSS variables in mixed segments
  const controls: Controls = animate(seq as any);
  controls.pause();
  return { controls, landing };
}

/**
 * "Game day, start to whistle": a pinned, scroll-scrubbed story where a game
 * card flips into a 3D pitch, fills, swaps in a waitlisted player and locks.
 */
export function GameDayStory() {
  const live = useLiveMotion();
  const [built, setBuilt] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const moneyRef = useRef<HTMLSpanElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const timeline = useRef<{ controls: Controls; landing: number[] } | null>(null);
  const last = useRef({ count: -1, step: -1 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Fit the 820×600 scene to its column.
  useEffect(() => {
    const story = ref.current;
    const scene = story?.querySelector<HTMLElement>(".sscene");
    const fit = story?.querySelector<HTMLElement>(".fit");
    if (!scene || !fit) return;
    const doFit = () => {
      const f = Math.min(1, scene.clientWidth / 840, scene.clientHeight / 600);
      fit.style.setProperty("--fit", Math.max(0.3, f).toFixed(3));
    };
    doFit();
    const ro = new ResizeObserver(doFit);
    ro.observe(scene);
    return () => ro.disconnect();
  }, [built]);

  // Counters and step pills follow the timeline in both scroll directions.
  const tick = (t: number) => {
    let count = (timeline.current?.landing ?? []).filter((l) => t >= l).length;
    if (t >= 6.35) count -= 1;
    if (t >= 7.76) count += 1;
    count = Math.max(0, Math.min(14, count));
    if (count !== last.current.count) {
      last.current.count = count;
      if (countRef.current) countRef.current.textContent = String(count);
      if (moneyRef.current) moneyRef.current.textContent = String(count * PRICE);
    }
    const step = t < 2.45 ? 0 : t < 5.3 ? 1 : t < 7.8 ? 2 : 3;
    if (step !== last.current.step) {
      last.current.step = step;
      stepsRef.current?.querySelectorAll("li").forEach((li, i) => li.classList.toggle("on", i === step));
    }
  };

  useEffect(() => {
    if (!live) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- switch to the pinned layout before building against it
    setBuilt(true);
  }, [live]);

  useEffect(() => {
    if (!built || !ref.current) return;
    try {
      timeline.current = buildTimeline(ref.current);
      const t = scrollYProgress.get() * TIMELINE;
      timeline.current.controls.time = t;
      tick(t);
    } catch (error) {
      console.error("Game day story failed to start", error);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fall back to the static final state
      setBuilt(false);
    }
    return () => {
      timeline.current?.controls.cancel();
      timeline.current = null;
      last.current = { count: -1, step: -1 };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- build once per switch to the pinned layout
  }, [built]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!timeline.current) return;
    const t = p * TIMELINE;
    timeline.current.controls.time = t;
    tick(t);
  });

  return (
    <section className={built ? "story live" : "story"} id="flow" aria-label="How a game fills" ref={ref}>
      <div className="stage">
        <div className="wrap sgrid">
          <div>
            <h2 className="eyebrow">Game day, start to whistle</h2>
            <ol className="steps" aria-hidden="true" ref={stepsRef}>
              {STEPS.map((s, i) => (
                <li key={s} className={i === 3 ? "on" : undefined}>
                  <b>0{i + 1}</b>
                  {s}
                </li>
              ))}
            </ol>
            <div className="caps2">
              {CAPTIONS.map((c) => (
                <div className="cap cap2" key={c.n}>
                  <span className="cn">{c.n}</span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="sscene"
            role="img"
            aria-label="A game card flips down into a 3D pitch. Fourteen players drop into their spots and pay, one drops out, a waitlisted player hops in, and the lineup locks."
          >
            <div className="sstatus">
              <span className="glass">Sunday Night 7s</span>
              <span className="glass">
                <span>
                  <span className="hl" ref={countRef}>14</span>/14 claimed
                </span>
              </span>
              <span className="glass money">
                <span>
                  <span className="okc">
                    $<span ref={moneyRef}>{14 * PRICE}</span>
                  </span>{" "}
                  collected
                </span>
              </span>
            </div>

            <div className="fit">
              <div className="sp-plane">
                <div className="mk mk-mid" />
                <div className="mk mk-c" />
                <div className="mk mk-l" />
                <div className="mk mk-r" />
                <div className="fl-pools">
                  {POOLS.map(([x, y], i) => (
                    <div className="fl-pool" key={i} style={{ left: x, top: y }} />
                  ))}
                </div>
                <div className="bench">Waitlist</div>
                {SLOTS.map((s, i) => (
                  <div className="sp-slot" key={i} style={{ left: s.x, top: s.y }} />
                ))}
                {SLOTS.map((s, i) => (
                  <div className="sp-rip" key={i} style={{ left: s.x, top: s.y }} />
                ))}
                <div className="sp-open" style={{ left: OPEN_SLOT.x, top: OPEN_SLOT.y }} />
                <svg className="sp-lines" viewBox="0 0 760 460" aria-hidden="true">
                  {LINES.map((l, i) => (
                    <path key={i} className={l.cls} pathLength={1} d={l.d} />
                  ))}
                </svg>
                <div className="sweep" />

                {SLOTS.map((s, i) => (
                  <div key={i} className={`sp-tok pl ${i < 7 ? "a" : "b"}${i === 10 ? " leaving" : ""}`} style={{ left: s.x, top: s.y }}>
                    <div className="sp-foot" />
                    <div className="sp-pin">
                      <div className="sp-stem" />
                      <div className="sp-head">{JERSEYS[i]}</div>
                      <div className="sp-cash">
                        <span>+${PRICE}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {[
                  { n: 17, x: OPEN_SLOT.x, y: OPEN_SLOT.y, cash: true },
                  { n: 21, x: 304, y: 520 },
                  { n: 23, x: 364.8, y: 520 },
                ].map((b) => (
                  <div key={b.n} className="sp-tok w bench-tok" style={{ left: b.x, top: b.y }}>
                    <div className="sp-foot" />
                    <div className="sp-pin">
                      <div className="sp-stem" />
                      <div className="sp-head">{b.n}</div>
                      {b.cash && (
                        <div className="sp-cash">
                          <span>+${PRICE}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {LIGHTS.map(([x, y], i) => (
                  <div className="fl-tok" key={i} style={{ left: x, top: y }}>
                    <div className="fl-mast">
                      <div className="fl-pole" />
                      <div className="fl-head">
                        <div className="fl-glow" />
                        <div className="fl-bulbs" />
                        <div className="fl-burst" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="post">
                  <div className="post-top">
                    <span className="ptag">
                      <span className="dot" />
                      New game
                    </span>
                    <span>Brewer Park Turf</span>
                  </div>
                  <div>
                    <div className="ptitle">Sunday Night 7s</div>
                    <div className="prow2">
                      <span>[DATE] · [TIME]</span>
                      <span>${PRICE} a spot</span>
                      <span>14 spots</span>
                    </div>
                  </div>
                  <div className="postbtn">
                    <span className="pb-a">Post to club</span>
                    <span className="pb-b">Posted · link sent to club</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stamp-pos" aria-hidden="true">
              <div className="stamp">
                <span>Lineup</span>
                <span>locked</span>
              </div>
            </div>
            {SPARKS.map((p, i) => (
              <div key={i} className={p.cls} data-dx={p.dx} data-dy={p.dy} />
            ))}
            <div className="sflash" aria-hidden="true" />
            <div className="sready glass">
              <span className="dot" />
              Lineup ready · Kickoff [TIME]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
