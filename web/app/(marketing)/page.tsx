import Link from "next/link";
import {
  CreditCard,
  Users,
  ArrowLeftRight,
  ShieldCheck,
  Megaphone,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const FEATURES = [
  {
    icon: Users,
    title: "Private clubs",
    body: "Invite-only organizations keep your regular crew together. Members join with a code — no randoms.",
  },
  {
    icon: CreditCard,
    title: "Payments that just work",
    body: "Collect game fees up front or pay-later with a deadline. No more chasing e-transfers on game day.",
  },
  {
    icon: ArrowLeftRight,
    title: "Waitlists & spot transfers",
    body: "Full game? The next person is offered the spot automatically — and only charged if they accept.",
  },
  {
    icon: ShieldCheck,
    title: "Fair & reliable",
    body: "Reliability scores and clear cancellation policies keep no-shows down and rosters honest.",
  },
  {
    icon: Megaphone,
    title: "Club announcements",
    body: "Post updates once and everyone sees them. Light or dark shirts? Field change? Sorted.",
  },
  {
    icon: CalendarCheck,
    title: "One tap to join",
    body: "Browse open games across your clubs, see who's in, and lock your spot in seconds.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Join your club",
    body: "Get an invite link or code from your organizer and you're in. All your games in one place.",
  },
  {
    n: "02",
    title: "Reserve your spot",
    body: "Pick a game, see the roster, pay your share, and you're confirmed. Can't make it? Transfer it.",
  },
  {
    n: "03",
    title: "Show up & play",
    body: "Get reminders, directions, and team info. Spend your energy on the pitch, not the spreadsheet.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[640px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-600" />
                Pickup soccer, organized
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-5xl font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-6xl">
                Run your pickup games like a pro.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
                KickLink handles the rosters, payments, waitlists and spot
                transfers — so your club just shows up and plays.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Get started free
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Log in
                  </Button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-sm text-ink-3">
                Free for players · No app download required
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:pl-6">
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          {[
            ["3", "clubs in Ottawa"],
            ["140+", "players"],
            ["98%", "show-up rate"],
            ["<10s", "to join a game"],
          ].map(([stat, label], i) => (
            <Reveal key={label} delay={i * 0.05} className="text-center">
              <div className="text-3xl font-bold tracking-[-0.02em] text-ink">
                {stat}
              </div>
              <div className="mt-1 text-sm text-ink-3">{label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-[-0.03em] text-ink">
            Everything your club needs, nothing it doesn&apos;t
          </h2>
          <p className="mt-4 text-lg text-ink-2">
            Built for the realities of organizing weekly games — the payments,
            the no-shows, the last-minute drop-outs.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <RevealItem key={f.title}>
              <div className="group h-full rounded-2xl bg-surface p-6 ring-1 ring-line shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <f.icon className="size-5.5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  {f.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="max-w-xl">
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-ink">
              From group chat chaos to game day, in three steps
            </h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <RevealItem key={s.n}>
                <div className="text-6xl font-bold tracking-tight text-brand-200">
                  {s.n}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  {s.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ─── Organizer CTA ────────────────────────────────────── */}
      <section id="clubs" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-field px-8 py-16 text-center shadow-brand sm:px-16">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-[-0.03em] text-white">
              Organize a club? Get your weekends back.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Create games, manage rosters, collect payments and run waitlists —
              all from one dashboard.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-brand-700 shadow-none hover:bg-white/90"
                >
                  Start organizing
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <Logo size={28} />
          <p className="text-sm text-ink-3">
            © {new Date().getFullYear()} KickLink · Ottawa, ON
          </p>
        </div>
      </footer>
    </>
  );
}
