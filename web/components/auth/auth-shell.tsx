import type { CSSProperties, ReactNode } from "react";
import "@fontsource-variable/archivo/wdth.css";
import "@/app/glass.css";
import { GlassBackdrop } from "@/components/glass/backdrop";
import { GlassLogo } from "@/components/glass/logo";
import { TiltCard } from "@/components/glass/tilt-card";
import { rise } from "@/components/auth/rise";

const FEATURES = [
  {
    title: "Find games near you",
    body: "Browse open pickup games close by and jump in with a tap.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.2" fill="#F4D78B" stroke="none" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </>
    ),
  },
  {
    title: "Collect dues automatically",
    body: "Collect the field fee from everyone before kickoff.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v9M14.4 9.6c-.6-.7-1.5-1-2.4-1-1.4 0-2.4.8-2.4 1.9 0 2.6 4.8 1.5 4.8 4 0 1.1-1 1.9-2.4 1.9-.9 0-1.8-.3-2.4-1" />
      </>
    ),
  },
  {
    title: "Build your full roster",
    body: "Track who is in and fill the empty spots week to week.",
    icon: (
      <>
        <circle cx="8" cy="8" r="3.2" />
        <path d="M3.5 19c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6" />
        <path d="M16 5.5c1.6.3 2.7 1.6 2.7 3.2 0 1.6-1.1 2.9-2.7 3.2M17.5 14.6c2 .5 3.5 2.1 3.5 4.4" />
      </>
    ),
  },
];

// The passing chain GK -> LB -> CM -> RW -> ST, with each receiver's arrival
// time on the 7-second loop; the last four players are off the ball.
const PLAYERS: { x: number; y: number; n: number; cls: string; t: string }[] = [
  { x: 50, y: 170, n: 1, cls: "a", t: "0s" },
  { x: 150, y: 262, n: 4, cls: "a", t: "0.97s" },
  { x: 250, y: 170, n: 8, cls: "a", t: "1.94s" },
  { x: 300, y: 58, n: 7, cls: "a", t: "2.81s" },
  { x: 400, y: 170, n: 9, cls: "a", t: "3.89s" },
  { x: 150, y: 80, n: 5, cls: "a np", t: "0s" },
  { x: 300, y: 282, n: 11, cls: "a np", t: "0s" },
  { x: 470, y: 100, n: 4, cls: "b np", t: "0s" },
  { x: 470, y: 240, n: 5, cls: "b np", t: "0s" },
];

function PassingScene() {
  return (
    <div className="scene" role="img" aria-label="A 3D pitch where gold players pass the ball along a glowing line into the goal.">
      <div className="plane" style={{ "--yaw": "-16deg" } as CSSProperties}>
        <div className="mk mk-mid" />
        <div className="mk mk-c" />
        <div className="mk mk-l" />
        <div className="mk mk-r" />
        <div className="net" />
        <svg className="links" viewBox="0 0 560 340" aria-hidden="true">
          <path className="web" d="M50 170 L150 80 L300 58 M150 80 L250 170 L150 262 L50 170 M250 170 L300 282 L400 170 L300 58 L250 170 M150 262 L300 282 M400 170 L470 100 M400 170 L470 240 M470 100 L470 240" />
          <path className="pass" pathLength={1} d="M50 170 L150 262 L250 170 L300 58 L400 170 L548 170" />
        </svg>
        <div className="ball" />
        {PLAYERS.map((p, i) => (
          <div key={i} className={`tok ${p.cls}`} style={{ left: p.x, top: p.y, "--i": i, "--t": p.t } as CSSProperties}>
            <div className="foot" />
            <div className="halo" />
            <div className="pin">
              <div className="stem" />
              <div className="head">{p.n}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="fc glass" style={{ top: "8%", right: "4%", "--d": "1400ms" } as CSSProperties}>
        <span className="dot" />
        Sunday Night 7s · 14/14
      </div>
      <div className="fc glass" style={{ bottom: "10%", left: "2%", "--d": "1900ms" } as CSSProperties}>
        <svg className="okc" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        $12 paid · Spot confirmed
      </div>
    </div>
  );
}

/**
 * KickLink Glass auth layout (docs/design/kicklink-glass): brand panel with
 * the passing scene on the left, the page's form in a tilting glass card on
 * the right. Below 980px the panel stacks on top and the features hide.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="kl kl-auth">
      <GlassBackdrop glows={3} />

      <section className="art" aria-label="About KickLink">
        <GlassLogo animated />
        <div style={{ marginTop: "clamp(28px, 5vh, 64px)" }}>
          <span {...rise(0.2)} className="eyebrow rise">Your club, sorted</span>
          <h2 {...rise(0.28)}>
            Find your team.
            <br />
            <span className="ext">Play every week.</span>
          </h2>
          <p className="sub rise" style={rise(0.36).style}>
            One place to find games, sort the squad and split the costs, so you can just turn up and play.
          </p>
        </div>
        <PassingScene />
        <ul className="feats rise" style={rise(0.52).style}>
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {feature.icon}
              </svg>
              <div>
                <strong>{feature.title}</strong>
                <span>{feature.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <main className="side">
        <TiltCard className="card glass" maxX={3} maxY={4}>
          {children}
        </TiltCard>
      </main>
    </div>
  );
}
