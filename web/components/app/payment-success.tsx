"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, CalendarPlus, MapPin, Share2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PaymentSuccess({
  gameId,
  title,
  registrationStatus,
  paymentStatus,
}: {
  gameId: string;
  title: string;
  registrationStatus: string | null;
  paymentStatus: string | null;
}) {
  const router = useRouter();
  const [checking, startCheck] = useTransition();
  const [automaticChecksEnded, setAutomaticChecksEnded] = useState(false);
  const isPaid = registrationStatus === "CONFIRMED" && paymentStatus === "PAID";
  const isRefunded = paymentStatus === "REFUNDED";
  const isCancelled = registrationStatus === "CANCELLED";
  const pending = !isPaid && !isRefunded && !isCancelled;

  useEffect(() => {
    if (!pending) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      startCheck(() => router.refresh());
      attempts += 1;
      if (attempts >= 20) {
        window.clearInterval(timer);
        setAutomaticChecksEnded(true);
      }
    }, 3_000);
    return () => window.clearInterval(timer);
  }, [pending, router, startCheck]);

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={
          "flex size-20 items-center justify-center rounded-full text-on-brand " +
          (isPaid
            ? "bg-gold shadow-[0_10px_40px_rgba(231,185,90,0.4)]"
            : "bg-warn shadow-[0_10px_40px_rgba(240,180,76,0.3)]")
        }
      >
        {isPaid ? (
          <Check className="size-11" strokeWidth={3} />
        ) : (
          <Clock3 className="size-10" strokeWidth={3} />
        )}
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.02em] text-ink">
          {isPaid ? "You're in!" : isRefunded ? "Payment refunded" : isCancelled ? "Registration cancelled" : "Payment processing"}
        </h1>
        <p className="mt-2 text-ink-2">
          {isPaid ? (
            <>
              Your spot for <span className="font-semibold text-ink">{title}</span> is
              confirmed and paid.
            </>
          ) : isRefunded ? (
            <>Your payment for <span className="font-semibold text-ink">{title}</span> has been refunded.</>
          ) : isCancelled ? (
            <>Your spot for <span className="font-semibold text-ink">{title}</span> is no longer reserved. View your registration for details.</>
          ) : (
            <>
              Stripe is confirming your payment for{" "}
              <span className="font-semibold text-ink">{title}</span>. Your registration
              {automaticChecksEnded
                ? " is taking longer than expected. Check again below or return to your registration later."
                : " will update here as soon as confirmation arrives."}
            </>
          )}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Badge tone={isPaid ? "ok" : pending ? "warn" : "neutral"} dot>
            {isPaid ? "Confirmed" : registrationStatus ?? "Pending"}
          </Badge>
          <Badge tone={isPaid ? "ok" : pending ? "warn" : "neutral"} dot>
            {isPaid ? "Paid" : paymentStatus ?? "Processing"}
          </Badge>
        </div>
        {pending && (
          <Button
            className="mt-4"
            variant="secondary"
            loading={checking}
            onClick={() => startCheck(() => router.refresh())}
          >
            Check payment status
          </Button>
        )}
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
