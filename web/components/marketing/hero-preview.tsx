"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, MapPin, Sparkles, Users } from "lucide-react";

const PLAYERS = [
  { initials: "RK", x: "50%", y: "89%", color: "#3d6fe0" },
  { initials: "LC", x: "24%", y: "70%", color: "#d8455f" },
  { initials: "NP", x: "76%", y: "70%", color: "#3fb996" },
  { initials: "DT", x: "23%", y: "48%", color: "#e0a24a", dark: true },
  { initials: "GO", x: "77%", y: "48%", color: "#a56fe0" },
  { initials: "JM", x: "50%", y: "55%", color: "#48c0e0", dark: true, delay: 0.9 },
];

export function HeroPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[25rem]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 22, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 z-20 rounded-2xl border border-gold-400/25 bg-[#15110a] p-3 pr-4 shadow-[0_24px_54px_-26px_rgba(0,0,0,0.85)] sm:-left-9 sm:-top-5"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
            <span className="absolute size-2 rounded-full bg-gold-400 animate-soft-ping" />
            <Sparkles className="relative size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#f4efe3]">A spot just opened</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#9a9c8f]">You are next in line</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={reduceMotion ? undefined : { rotateX: 2, rotateY: -4, y: -4 }}
        className="relative overflow-hidden rounded-[1.6rem] border border-gold-400/15 bg-[#11140f] shadow-[0_36px_90px_-42px_rgba(0,0,0,0.95)]"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400">Sunday pickup</p>
            <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-[#f4efe3] sm:text-3xl">
              Sunday Night 7s
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[#9a9c8f]">
              <MapPin className="size-4 text-gold-400/80" />
              Brewer Park Turf
              <span className="opacity-50">8:00 PM</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gold-400">$12</div>
            <div className="text-[11px] font-semibold text-[#74776c]">per player</div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-match-field relative aspect-[300/350] overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.025)_0_7%,rgba(0,0,0,.04)_7%_14%)]" />
            <div className="absolute -top-[30%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(233,190,90,.18),transparent_72%)]" />

            <svg
              viewBox="0 0 300 350"
              className="absolute inset-0 size-full"
              fill="none"
              stroke="rgba(228,236,230,.24)"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="284" height="334" rx="8" />
              <line x1="8" y1="175" x2="292" y2="175" />
              <circle cx="150" cy="175" r="34" stroke="rgba(233,190,90,.42)" />
              <circle cx="150" cy="175" r="3" fill="rgba(233,190,90,.65)" stroke="none" />
              <rect x="74" y="8" width="152" height="52" />
              <rect x="116" y="8" width="68" height="22" />
              <path d="M124 60a32 30 0 0 0 52 0" />
              <rect x="74" y="290" width="152" height="52" />
              <rect x="116" y="320" width="68" height="22" />
              <path d="M124 290a32 30 0 0 1 52 0" />
            </svg>

            {!reduceMotion && (
              <span className="absolute left-1/2 top-1/2 z-10 size-3 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#cfcfc4)] shadow-[0_0_12px_rgba(255,255,255,.5)] animate-field-ball" />
            )}

            {PLAYERS.map((player, index) => (
              <motion.span
                key={player.initials}
                initial={reduceMotion ? false : { opacity: player.delay ? 0 : 1, scale: player.delay ? 0.55 : 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: player.delay ?? 0.2 + index * 0.05, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/85 text-[11px] font-black shadow-[0_7px_18px_rgba(0,0,0,.42)]"
                style={{
                  left: player.x,
                  top: player.y,
                  background: player.color,
                  color: player.dark ? "#1a1408" : "#fff",
                }}
              >
                {player.initials}
              </motion.span>
            ))}

            <span className="absolute left-1/2 top-[26%] z-30 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-gold-400/80" />
            {!reduceMotion && (
              <span className="absolute left-1/2 top-[26%] z-20 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-400 animate-ring-pulse" />
            )}
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute left-1/2 top-[26%] z-40 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#fbe7b4] bg-gradient-to-br from-gold-300 to-gold-500 text-[11px] font-black text-[#1a1408] shadow-[0_8px_18px_rgba(233,190,90,.5)]"
            >
              YOU
            </motion.span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-grass-500 opacity-80 animate-soft-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-grass-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-grass-500">Lineup ready</span>
            </div>
            <div className="text-lg font-black text-[#f1ece0]">
              <span className="text-gold-400">14</span>/14
            </div>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={reduceMotion ? false : { width: "72%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-300 shadow-[0_0_14px_rgba(233,190,90,.55)]"
            />
          </div>

          <motion.div
            initial={reduceMotion ? false : { scale: 0.96 }}
            animate={{ scale: [1, 0.97, 1] }}
            transition={{ delay: 1.15, duration: 0.45 }}
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-grass-500 to-grass-600 text-[15px] font-black text-[#06120c] shadow-[0_14px_28px_-12px_rgba(84,224,160,.65)]"
          >
            <Check className="size-4" />
            You are in
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[linear-gradient(115deg,transparent_42%,rgba(244,210,122,.06)_50%,transparent_58%)]" />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 22, y: 22 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-6 -right-1 z-20 rounded-2xl border border-grass-500/30 bg-[#15110a] p-3 pr-4 shadow-[0_26px_54px_-24px_rgba(0,0,0,0.85)] sm:-right-7"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-grass-500 to-grass-600 text-[#06120c]">
            <Check className="size-4 stroke-[3]" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#f3eee2]">Payment confirmed</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-grass-500">
              <Users className="size-3.5" />
              You are in the lineup
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
