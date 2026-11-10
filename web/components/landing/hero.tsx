import type { CSSProperties } from "react";
import { MagneticLink } from "@/components/glass/magnetic";
import { SplitLetters, lineText } from "@/components/glass/split-letters";
import { HERO_SLOTS, JERSEYS, SPORTS } from "./data";

const HEADLINE = [
  [{ text: "Lock" }, { text: "the" }, { text: "lineup" }],
  [{ text: "before" }, { text: "kickoff.", className: "ext" }],
];

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <span className="chip glass rise" style={d(80)}>
          <span className="dot" />
          Pickup games, organized
        </span>
        <h1 className="display" aria-label={lineText(HEADLINE)}>
          <SplitLetters lines={HEADLINE} />
        </h1>

        <div className="hero-grid">
          <div>
            <p className="lede rise" style={d(700)}>
              KickLink helps private pickup clubs manage rosters, payments, waitlists and attendance for any sport,
              without the group chat scramble.
            </p>
            <div className="ctas rise" style={d(820)}>
              <MagneticLink
                className="btn btn-p"
                href="/signup"
                data-analytics-event="marketing.signup_cta_click"
                data-analytics-label="hero"
              >
                Get started free
                {ARROW}
              </MagneticLink>
              <MagneticLink
                className="btn btn-s"
                href="/login"
                data-analytics-event="marketing.login_cta_click"
                data-analytics-label="hero"
              >
                Log in
              </MagneticLink>
            </div>
            <p className="fine rise" style={d(920)}>
              Free for players. Built for clubs that play every week.
            </p>
            <ul className="pills rise" style={d(1000)} aria-label="Sports clubs run on KickLink">
              {SPORTS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div
            className="scene"
            role="img"
            aria-label="A 3D pitch filling with fourteen players, with cards showing Sunday Night 7s at Brewer Park Turf, payment confirmed, and lineup ready 14 of 14."
          >
            <div className="plane" style={{ "--yaw": "-22deg" } as CSSProperties}>
              <div className="mk mk-mid" />
              <div className="mk mk-c" />
              <div className="mk mk-l" />
              <div className="mk mk-r" />
              {HERO_SLOTS.map(([x, y], i) => (
                <div key={i} className={`tok ${i < 7 ? "a" : "b"}`} style={{ left: `${x}%`, top: `${y}%`, "--i": i } as CSSProperties}>
                  <div className="foot" />
                  <div className="pin">
                    <div className="stem" />
                    <div className="head">{JERSEYS[i]}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="fc glass" style={{ top: 28, left: 0, ...d(500) }}>
              <strong>Sunday Night 7s</strong>
              <span>Brewer Park Turf · [TIME]</span>
            </div>
            <div className="fc glass" style={{ top: 150, right: 0, ...d(1500) }}>
              <strong>$12 per player</strong>
              <span className="row okc">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                <span style={{ color: "var(--text)", fontSize: 14 }}>Payment confirmed</span>
              </span>
            </div>
            <div className="fc glass" style={{ bottom: 36, left: "14%", ...d(2200) }}>
              <span className="row">
                <span className="dot" />
                14/14 · <span className="okc">Lineup ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
