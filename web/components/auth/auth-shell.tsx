import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { NetworkCanvas } from "@/components/auth/network-canvas";
import { rise } from "@/components/auth/rise";


const FEATURES = [
  {
    title: "Find games near you",
    body: "Browse open matches and pickup games close by, and jump in with a tap.",
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
    body: "Split the pitch fee and collect from everyone before kickoff — no more chasing e-transfers.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v9M14.4 9.6c-.6-.7-1.5-1-2.4-1-1.4 0-2.4.8-2.4 1.9 0 2.6 4.8 1.5 4.8 4 0 1.1-1 1.9-2.4 1.9-.9 0-1.8-.3-2.4-1" />
      </>
    ),
  },
  {
    title: "Build your full roster",
    body: "Track who's in, fill the empty spots, and keep your squad organised week to week.",
    icon: (
      <>
        <circle cx="8" cy="8" r="3.2" />
        <path d="M3.5 19c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6" />
        <path d="M16 5.5c1.6.3 2.7 1.6 2.7 3.2 0 1.6-1.1 2.9-2.7 3.2M17.5 14.6c2 .5 3.5 2.1 3.5 4.4" />
      </>
    ),
  },
];

function BrandPanel() {
  return (
    <div className="relative min-h-[560px] overflow-hidden bg-[#08080a] text-[#f5f3ef] min-[881px]:min-h-0 min-[881px]:flex-[1.22]">
      <div className="bg-brand-field absolute inset-0" />
      <div className="absolute -right-[70px] -top-[90px] size-[360px] rounded-full bg-[radial-gradient(circle,rgba(244,215,139,0.32),rgba(244,215,139,0)_70%)] blur-[20px]" />
      <div className="absolute -bottom-[110px] -left-[80px] size-[400px] rounded-full bg-[radial-gradient(circle,rgba(231,185,90,0.22),rgba(231,185,90,0)_70%)] blur-[22px]" />
      <NetworkCanvas className="absolute inset-0 size-full opacity-85" />

      <div className="relative z-[2] flex h-full min-h-[560px] flex-col justify-between gap-10 px-7 py-12 min-[881px]:px-[54px] min-[881px]:py-[50px]">
        <div {...rise(0.2)}>
          <span className="flex items-center gap-2.5">
            <LogoMark size={32} variant="subtle" />
            <span className="font-display text-[17px] font-bold tracking-[-0.01em]">KickLink</span>
          </span>
        </div>

        <div className="max-w-[540px]">
          <span
            {...rise(0.28)}
            className="animate-rise mb-[18px] inline-block text-[11px] font-bold tracking-[0.18em] text-brand-600"
          >
            YOUR CLUB, SORTED
          </span>
          <h2
            {...rise(0.34)}
            className="animate-rise mb-4 text-[clamp(30px,3.2vw,44px)] font-bold leading-[1.05] tracking-[-0.02em]"
          >
            Find your team.
            <br />
            <span className="text-gold-gradient">Play every week.</span>
          </h2>
          <p
            {...rise(0.4)}
            className="animate-rise mb-[34px] max-w-[440px] text-base leading-[1.55] text-[#a29a8c]"
          >
            One place to find games, sort the squad, and split the costs — so you can just turn up
            and play.
          </p>

          <div className="flex flex-col gap-3">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                {...rise(0.48 + i * 0.08)}
                className="animate-rise flex items-start gap-[15px] rounded-2xl border border-[rgba(231,185,90,0.14)] bg-white/[0.035] px-[19px] py-[17px] transition-[transform,border-color,background-color] duration-250 hover:translate-x-[5px] hover:border-[rgba(231,185,90,0.4)] hover:bg-white/[0.06]"
              >
                <div className="flex size-[42px] flex-none items-center justify-center rounded-xl border border-[rgba(231,185,90,0.3)] bg-[rgba(231,185,90,0.12)]">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F4D78B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {feature.icon}
                  </svg>
                </div>
                <div>
                  <div className="mb-[3px] text-[15px] font-bold text-[#f2ede1]">{feature.title}</div>
                  <div className="text-[13.5px] leading-normal text-[#968f82]">{feature.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div {...rise(0.72)} className="animate-rise flex items-center gap-2.5">
          <span className="h-px w-6 bg-[linear-gradient(90deg,#e7b95a,rgba(231,185,90,0))]" />
          <span className="text-[12.5px] font-semibold tracking-[0.04em] text-[#7e796e]">
            Built for grassroots football.
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Split auth layout from the sign-up design: form panel (left) and animated
 * brand panel (right). Below 881px the brand panel stacks under the form.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-[#08080a] min-[881px]:flex-row">
      <div className="relative flex flex-col items-center justify-center bg-[#0c0c0f] px-7 pb-12 pt-[118px] min-[881px]:flex-[1.02] min-[881px]:px-14 min-[881px]:py-[118px]">
        <div className="pointer-events-none absolute -left-[120px] -top-[120px] size-[360px] rounded-full bg-[radial-gradient(circle,rgba(231,185,90,0.12),rgba(231,185,90,0)_70%)]" />
        <Link
          href="/"
          {...rise(0)}
          className="animate-rise absolute left-7 top-[38px] min-[881px]:left-14"
          aria-label="KickLink home"
        >
          <Logo size={38} />
        </Link>
        <div className="relative w-full max-w-[418px]">{children}</div>
      </div>
      <BrandPanel />
    </div>
  );
}
