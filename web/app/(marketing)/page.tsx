import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Megaphone,
  ShieldCheck,
  Shuffle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const FEATURES = [
  {
    icon: Users,
    title: "Private clubs",
    body: "Members stay inside their own organizations, with club-specific rosters, games, announcements and payments.",
  },
  {
    icon: CreditCard,
    title: "Game fees handled",
    body: "Players can pay for eligible games online, with money routed to the organizer's connected account.",
  },
  {
    icon: Shuffle,
    title: "Waitlists and transfers",
    body: "When a player drops, the next person can be offered the spot without the organizer rebuilding the lineup.",
  },
  {
    icon: ShieldCheck,
    title: "Fewer no-shows",
    body: "Registration status, attendance, cancellations and audit history give organizers a cleaner operating record.",
  },
  {
    icon: Megaphone,
    title: "Club announcements",
    body: "Send field changes, kit reminders and schedule updates from one place instead of chasing group chats.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly pickup ready",
    body: "Create one-off games today, with recurring pickup series becoming the foundation for weekly clubs.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Join your club",
    body: "Players sign up, complete their profile and join the organizations they actually play with.",
  },
  {
    n: "02",
    title: "Claim a spot",
    body: "Browse eligible games, see the details, pay if needed and get a confirmed registration.",
  },
  {
    n: "03",
    title: "Show up and play",
    body: "Organizers see the roster, record attendance and keep club history accurate after the match.",
  },
];

const STATS = [
  ["3", "clubs in Ottawa"],
  ["140+", "players"],
  ["98%", "show-up rate"],
  ["<10s", "to join a game"],
];

export default function LandingPage() {
  return (
    <>
      <section className="bg-landing-field relative isolate overflow-hidden pt-28 text-white sm:pt-36">
        <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 size-[34rem] -translate-x-1/2 rounded-full border border-gold-400/25" />
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 size-[18rem] -translate-x-1/2 rounded-full border border-gold-400/20" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
                <span className="size-1.5 animate-pulse rounded-full bg-grass-500" />
                Pickup soccer, organized
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 max-w-3xl text-[clamp(2.85rem,12vw,4.5rem)] font-black uppercase leading-[0.95] tracking-[-0.035em] text-[#f4efe3] sm:text-7xl sm:tracking-[-0.045em]">
                <span className="block">Lock the</span>
                <span className="block">lineup before</span>
                <span className="block">kickoff.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[20.5rem] text-base leading-relaxed text-[#c8c4b7] sm:max-w-xl sm:text-xl">
                KickLink helps private pickup clubs manage rosters, payments,
                waitlists and attendance without the group chat scramble.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-[0_18px_40px_-18px_rgba(233,190,90,.9)] hover:brightness-105"
                  >
                    Get started free
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border border-white/10 bg-white/8 text-white ring-0 hover:bg-white/14"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-sm font-medium text-[#9a9c8f]">
                Free for players. Built for clubs that play every week.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:pl-6">
            <HeroPreview />
          </Reveal>
        </div>

        <div className="relative border-y border-gold-400/15 bg-white/[0.025]">
          <section className="mx-auto max-w-6xl px-5 py-10">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map(([stat, label], i) => (
                <Reveal key={label} delay={i * 0.05} className="text-center">
                  <div className="text-4xl font-black tracking-tight text-[#f4efe3]">
                    {stat}
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#85887c]">
                    {label}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-gold-500">
            Built for real pickup
          </span>
          <h2 className="mt-3 text-balance text-4xl font-black tracking-[-0.03em] text-ink">
            The clean operating system for weekly games
          </h2>
          <p className="mt-4 text-lg text-ink-2">
            KickLink keeps the player experience fast while giving organizers
            the controls they need behind the scenes.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title}>
              <div className="group h-full rounded-2xl bg-surface p-6 ring-1 ring-line shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop">
                <span className="flex size-11 items-center justify-center rounded-xl bg-field-800 text-gold-300 transition-colors group-hover:bg-gold-400 group-hover:text-field-950">
                  <feature.icon className="size-5.5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  {feature.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section id="how" className="scroll-mt-20 border-y border-line bg-surface/70">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="max-w-xl">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-gold-500">
              Game day flow
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-ink">
              From invite to attendance in three steps
            </h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <RevealItem key={step.n}>
                <div className="text-6xl font-black tracking-tight text-gold-400/60">
                  {step.n}
                </div>
                <h3 className="mt-3 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="clubs" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <div className="bg-landing-field relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-[0_26px_70px_-34px_rgba(8,10,9,.85)] sm:px-16">
          <div className="bg-field-lines pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative">
            <Logo size={34} light className="justify-center" />
            <h2 className="mx-auto mt-8 max-w-2xl text-balance text-4xl font-black uppercase tracking-[-0.03em] text-[#f4efe3]">
              Organize a club? Get your weekends back.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#c8c4b7]">
              Create games, manage rosters, collect eligible payments and keep
              attendance history in one dashboard.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gold-300 to-gold-500 text-[#1a1408] shadow-none hover:brightness-105"
                >
                  Start organizing
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <Logo size={28} />
          <p className="text-sm text-ink-3">
            (c) {new Date().getFullYear()} KickLink. Ottawa, ON.
          </p>
        </div>
      </footer>
    </>
  );
}
