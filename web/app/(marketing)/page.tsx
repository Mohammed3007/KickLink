import "@fontsource-variable/archivo/wdth.css";
import "@/app/glass.css";
import { GlassBackdrop } from "@/components/glass/backdrop";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { GameDayStory } from "@/components/landing/game-day-story";
import { Ticker } from "@/components/landing/ticker";
import { Statement } from "@/components/landing/statement";
import { StepRing } from "@/components/landing/step-ring";
import { FeatureStack } from "@/components/landing/feature-stack";
import { Audience, FeaturesIntro, Pricing, Quote } from "@/components/landing/sections";
import { Contact } from "@/components/landing/contact";
import { LandingFooter } from "@/components/landing/landing-footer";

// KickLink Glass landing page; design in docs/design/kicklink-glass.
export default function LandingPage() {
  return (
    <div className="kl kl-land">
      <GlassBackdrop fixed />
      <LandingNav />
      <main>
        <Hero />
        <GameDayStory />
        <Ticker />
        <Statement />
        <StepRing />
        <section className="sec" id="features">
          <div className="wrap">
            <FeaturesIntro />
            <FeatureStack />
          </div>
        </section>
        <Audience />
        <Quote />
        <Pricing />
        <Contact />
      </main>
      <LandingFooter />
    </div>
  );
}
