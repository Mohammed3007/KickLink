"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitOrganizerLead } from "@/lib/actions/leads";
import { MagneticButton } from "@/components/glass/magnetic";
import { TiltCard } from "@/components/glass/tilt-card";
import { BlurUp } from "./blur-up";
import { SPORTS } from "./data";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <MagneticButton
      className="btn btn-p"
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      data-analytics-event="marketing.organizer_lead_submit"
    >
      {pending ? (
        <>
          <span className="spin" aria-hidden="true" />
          Sending…
        </>
      ) : (
        <>
          Start organizing
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </>
      )}
    </MagneticButton>
  );
}

/** "Organize a club?" request form; saved to Admin → Leads and emailed to support. */
export function Contact() {
  const [state, action] = useActionState(submitOrganizerLead, undefined);
  return (
    <section className="sec" id="clubs">
      <div className="wrap cgrid">
        <BlurUp>
          <span className="eyebrow">For organizers</span>
          <h2 className="title">
            Organize a club? <span className="ext">Get your weekends back.</span>
          </h2>
          <p className="lede">
            Create games, manage rosters, collect eligible payments and keep attendance history in one dashboard.
          </p>
        </BlurUp>

        <TiltCard className="cform glass">
          {state?.ok ? (
            <div className="sent" role="status">
              <span className="chip glass" style={{ alignSelf: "flex-start" }}>
                <span className="dot" />
                Request in
              </span>
              <h3 className="title" style={{ fontSize: 44 }}>
                You are on the list.
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                We will reach out about setting up your club within [RESPONSE TIME].
              </p>
            </div>
          ) : (
            <form action={action} className="fgrid">
              {state?.error && (
                <p className="form-error full" role="alert">
                  {state.error}
                </p>
              )}
              <div className="field">
                <label htmlFor="lead-name">Your name</label>
                <input id="lead-name" name="name" autoComplete="name" placeholder="Alex Martin" required minLength={2} maxLength={80} />
              </div>
              <div className="field">
                <label htmlFor="lead-email">Email</label>
                <input id="lead-email" name="email" type="email" autoComplete="email" placeholder="you@club.com" required maxLength={254} />
              </div>
              <div className="field">
                <label htmlFor="lead-club">Club name</label>
                <input id="lead-club" name="club" placeholder="Sunday Night 7s" maxLength={80} />
              </div>
              <div className="field">
                <label htmlFor="lead-sport">Sport</label>
                <select id="lead-sport" name="sport" defaultValue="Soccer">
                  {[...SPORTS, "Something else"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label htmlFor="lead-msg">How does your club run today?</label>
                <textarea
                  id="lead-msg"
                  name="message"
                  maxLength={2000}
                  placeholder="Weekly game, roughly how many players, how you collect fees now"
                />
              </div>
              {/* Honeypot: hidden from people, filled in by bots. */}
              <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor="lead-website">Website</label>
                <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="field full" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Submit />
              </div>
            </form>
          )}
        </TiltCard>
      </div>
    </section>
  );
}
