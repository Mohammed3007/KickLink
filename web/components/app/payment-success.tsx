"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, CalendarPlus, MapPin, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PaymentSuccess({
  gameId,
  title,
}: {
  gameId: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-20 items-center justify-center rounded-full bg-ok text-white shadow-[0_10px_40px_rgba(18,145,90,0.4)]"
      >
        <Check className="size-11" strokeWidth={3} />
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.02em] text-ink">
          You&apos;re in!
        </h1>
        <p className="mt-2 text-ink-2">
          Your spot for <span className="font-semibold text-ink">{title}</span> is
          confirmed and paid.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Badge tone="ok" dot>Confirmed</Badge>
          <Badge tone="ok" dot>Paid</Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 w-full space-y-2.5"
      >
        <div className="grid grid-cols-3 gap-2.5">
          <Mini icon={<CalendarPlus className="size-5" />} label="Calendar" />
          <Mini icon={<MapPin className="size-5" />} label="Directions" />
          <Mini icon={<Share2 className="size-5" />} label="Share" />
        </div>
        <Link href={`/games/${gameId}`}>
          <Button full size="lg">View registration</Button>
        </Link>
        <Link href="/home">
          <Button full size="lg" variant="ghost">Done</Button>
        </Link>
      </motion.div>
    </div>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface py-3 text-xs font-medium text-ink-2 ring-1 ring-line">
      <span className="text-brand-600">{icon}</span>
      {label}
    </div>
  );
}
