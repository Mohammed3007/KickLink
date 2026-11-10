"use client";

import { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLiveMotion } from "@/components/glass/use-live-motion";

type Tone = "ok" | "gd" | "mu";
const PANELS: { title: string; body: string; rows: [string, string, Tone][] }[] = [
  {
    title: "Private clubs",
    body: "Members stay inside their own organizations, with club-specific rosters, games, announcements and payments.",
    rows: [["[CLUB NAME]", "Members only", "gd"], ["Sunday Night 7s", "Club game", "mu"], ["Announcements", "Club only", "mu"]],
  },
  {
    title: "Game fees handled",
    body: "Players can pay for eligible games online, with money routed to the organizer's connected account.",
    rows: [["Sunday Night 7s · $12", "Paid", "ok"], ["Routed to [ORGANIZER]", "Connected account", "mu"]],
  },
  {
    title: "Automatic waitlists",
    body: "When a player drops, the next person can be offered the spot without the organizer rebuilding the lineup.",
    rows: [["#6 dropped out", "Cancelled", "mu"], ["Next on waitlist", "Spot offered", "gd"], ["[PLAYER] accepted", "Confirmed", "ok"]],
  },
  {
    title: "Fewer no-shows",
    body: "Registration status, attendance, cancellations and audit history give organizers a cleaner operating record.",
    rows: [["[PLAYER]", "Attended", "ok"], ["[PLAYER]", "Cancelled early", "mu"], ["[PLAYER]", "No-show", "gd"]],
  },
  {
    title: "Club announcements",
    body: "Send venue changes, jersey reminders and schedule updates from one place instead of chasing group chats.",
    rows: [["Venue change: [FIELD] tonight", "Sent", "gd"], ["Bring a light and a dark jersey", "Scheduled", "mu"]],
  },
  {
    title: "Weekly pickup ready",
    body: "Create one-off games today, with recurring pickup series becoming the foundation for weekly clubs.",
    rows: [["Sunday Night 7s", "This week", "ok"], ["Recurring series", "Coming", "gd"]],
  },
];

function Panel({
  i,
  self,
  next,
  live,
}: {
  i: number;
  self: RefObject<HTMLElement | null>;
  next: RefObject<HTMLElement | null> | null;
  live: boolean;
}) {
  const panel = PANELS[i];
  // Tilts up as it arrives…
  const arrive = useScroll({ target: self, offset: ["start end", "start 55%"] }).scrollYProgress;
  const rotateX = useTransform(arrive, [0, 1], [26, 0]);
  const y = useTransform(arrive, [0, 1], [90, 0]);
  const scale = useTransform(arrive, [0, 1], [0.94, 1]);
  // …and sinks back as the next panel covers it.
  const covered = useScroll({ target: next ?? self, offset: ["start 85%", "start 30%"] }).scrollYProgress;
  const sinkScale = useTransform(covered, [0, 1], [1, 0.92]);
  const sinkY = useTransform(covered, [0, 1], [0, -24]);
  const filter = useTransform(covered, [0, 1], ["blur(0px) brightness(1)", "blur(3px) brightness(0.5)"]);

  return (
    <article className="panel" ref={self} style={{ top: 112 + i * 18 }}>
      <motion.div className="tilt" style={live ? { rotateX, y, scale, transformPerspective: 1400 } : undefined}>
        <motion.div className="pbody glass" style={live && next ? { scale: sinkScale, y: sinkY, filter } : undefined}>
          <div>
            <span className="pn">0{i + 1}</span>
            <h3 className="pt">{panel.title}</h3>
            <p>{panel.body}</p>
          </div>
          <div className="mock">
            {panel.rows.map(([label, status, tone], r) => (
              <div className="mrow" key={r}>
                <span>{label}</span>
                <span className={`st ${tone}`}>{status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </article>
  );
}

/** Six sticky feature panels that stack over each other as you scroll. */
export function FeatureStack() {
  const live = useLiveMotion();
  const r0 = useRef<HTMLElement>(null);
  const r1 = useRef<HTMLElement>(null);
  const r2 = useRef<HTMLElement>(null);
  const r3 = useRef<HTMLElement>(null);
  const r4 = useRef<HTMLElement>(null);
  const r5 = useRef<HTMLElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  return (
    <div className="stack">
      {PANELS.map((_, i) => (
        <Panel key={i} i={i} self={refs[i]} next={refs[i + 1] ?? null} live={live} />
      ))}
    </div>
  );
}
