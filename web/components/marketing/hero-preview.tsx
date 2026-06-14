"use client";

import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ROSTER = ["Liam Carter", "Noah Patel", "Diego Torres", "Sam Okafor", "Theo Martin", "Marco Rossi"];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* glow */}
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-brand-300/30 blur-3xl" />

      {/* floating "spot opened" alert */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-6 -top-6 z-20 rounded-2xl bg-surface p-3 pr-4 shadow-pop ring-1 ring-line"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-alert-bg text-alert">
            <Zap className="size-4.5" fill="currentColor" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink">A spot just opened</p>
            <p className="text-[11px] text-ink-3">You&apos;re next in line · 8:57</p>
          </div>
        </div>
      </motion.div>

      {/* main game card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl bg-surface shadow-pop ring-1 ring-line"
      >
        <div className="bg-brand-field p-5 text-white">
          <div className="flex items-center justify-between">
            <Badge tone="brand" className="bg-white/20 text-white">
              7-a-side
            </Badge>
            <span className="text-sm font-semibold">$12.00</span>
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
            Sunday Night 7s
          </h3>
          <p className="mt-1 text-sm text-white/80">Westside Sunday League</p>
        </div>

        <div className="space-y-3 p-5">
          <Row icon={<Calendar className="size-4" />} label="Sun, Jun 15" />
          <Row icon={<Clock className="size-4" />} label="8:00 PM · 90 min" />
          <Row icon={<MapPin className="size-4" />} label="Brewer Park Turf" />

          <div className="flex items-center justify-between border-t border-line-2 pt-4">
            <AvatarStack names={ROSTER} max={5} size={30} />
            <span className="text-sm font-medium text-ink-2">11/14 in</span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex h-11 items-center justify-center rounded-2xl bg-brand-600 text-[15px] font-semibold text-white shadow-brand"
          >
            Join · $12.00
          </motion.div>
        </div>
      </motion.div>

      {/* floating confirmed chip */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-5 -right-4 z-20 flex items-center gap-2.5 rounded-2xl bg-surface p-3 pr-4 shadow-pop ring-1 ring-line"
      >
        <Avatar name="Daniel Osei" size={34} />
        <div>
          <p className="text-xs font-semibold text-ink">You&apos;re in!</p>
          <Badge tone="ok" dot className="mt-0.5 px-2 py-0.5">
            Confirmed
          </Badge>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-ink-2">
      <span className="text-ink-3">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
