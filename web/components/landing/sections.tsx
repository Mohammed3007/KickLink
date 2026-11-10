import Link from "next/link";
import { BlurUp } from "./blur-up";
import { SPORTS } from "./data";

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function FeaturesIntro() {
  return (
    <BlurUp style={{ maxWidth: 820 }}>
      <span className="eyebrow">Built for real pickup</span>
      <h2 className="title">
        The clean operating system for <span className="hl">weekly games.</span>
      </h2>
      <p className="lede">
        KickLink keeps the player experience fast while giving organizers the controls they need behind the scenes.
      </p>
    </BlurUp>
  );
}

export function Audience() {
  return (
    <section className="sec" aria-label="Sports">
      <div className="wrap">
        <BlurUp>
          <span className="eyebrow">Any sport with a lineup</span>
        </BlurUp>
        <ol className="biglist">
          {SPORTS.map((sport, i) => (
            <BlurUp as="li" key={sport}>
              <span className="bnum">0{i + 1}</span>
              <span className="bt">{sport}</span>
            </BlurUp>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Quote() {
  return (
    <section className="sec">
      <div className="wrap">
        <BlurUp>
          <figure className="qf">
            <svg width="56" height="44" viewBox="0 0 56 44" aria-hidden="true" style={{ color: "var(--gold)" }}>
              <path fill="currentColor" d="M0 44V27C0 12 7 3 21 0l3 6c-7 2-11 7-11 14h10v24H0zm32 0V27C32 12 39 3 53 0l3 6c-7 2-11 7-11 14h10v24H32z" />
            </svg>
            <blockquote>[ORGANIZER QUOTE: one line on what changed after moving the club to KickLink.]</blockquote>
            <figcaption>[NAME] · [ROLE], [CLUB]</figcaption>
          </figure>
        </BlurUp>
      </div>
    </section>
  );
}

const PRICES = [
  { name: "Players", desc: "Join clubs, claim spots and pay for eligible games in the app.", price: "Free", free: true, href: "/signup" },
  { name: "Organizers", desc: "Games, rosters, waitlists, announcements and attendance in one dashboard.", price: "[PRICE]", href: "#clubs" },
  { name: "Paid games", desc: "Online game fees routed to the organizer's connected account.", price: "[FEE]", href: "#clubs" },
];

export function Pricing() {
  return (
    <section className="sec" id="pricing">
      <div className="wrap">
        <BlurUp>
          <span className="eyebrow">Pricing</span>
          <h2 className="title">
            Free to play. <span className="hl">Fair to run.</span>
          </h2>
        </BlurUp>
        <ul className="prows">
          {PRICES.map((row) => (
            <BlurUp as="li" key={row.name}>
              <Link
                className="prow"
                href={row.href}
                {...(row.free
                  ? { "data-analytics-event": "marketing.signup_cta_click", "data-analytics-label": "pricing" }
                  : {})}
              >
                <span className="pname">{row.name}</span>
                <span className="pdesc">{row.desc}</span>
                <span className={row.free ? "price okc" : "price"}>{row.price}</span>
                <span className="arr" aria-hidden="true">
                  {ARROW}
                </span>
              </Link>
            </BlurUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
