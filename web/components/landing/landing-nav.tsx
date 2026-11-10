"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { GlassLogo } from "@/components/glass/logo";
import { MagneticLink } from "@/components/glass/magnetic";
import { useLiveMotion } from "@/components/glass/use-live-motion";

/** Sticky glass nav with a gold-to-green scroll-progress line. */
export function LandingNav() {
  const live = useLiveMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <header className="nav">
      <nav className="nav-in glass" aria-label="Main">
        <GlassLogo href="#top" />
        <div className="navlinks">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#clubs">For organizers</a>
        </div>
        <div className="navcta">
          <Link className="login" href="/login" data-analytics-event="marketing.login_cta_click" data-analytics-label="nav">
            Log in
          </Link>
          <MagneticLink
            className="btn btn-p btn-sm"
            href="/signup"
            data-analytics-event="marketing.signup_cta_click"
            data-analytics-label="nav"
          >
            Get started
          </MagneticLink>
        </div>
        {live && <motion.div className="prog" style={{ scaleX }} aria-hidden="true" />}
      </nav>
    </header>
  );
}
