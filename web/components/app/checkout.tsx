"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  CreditCard,
  Plus,
  Lock,
  ScanFace,
  Loader2,
  CalendarPlus,
  MapPin,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateChip } from "@/components/app/date-chip";
import { payAndConfirm } from "@/lib/actions/games";
import { formatPrice, formatGameDate, formatTime } from "@/lib/utils";

type Method = "apple_pay" | "card";

export function Checkout({
  game,
}: {
  game: {
    id: string;
    title: string;
    org: string;
    venue: string;
    startsAt: string;
    priceCents: number;
  };
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("apple_pay");
  const [sheet, setSheet] = useState<null | "confirm" | "processing" | "done">(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = formatPrice(game.priceCents);
  const startsAt = new Date(game.startsAt);

  async function confirm() {
    setSheet("processing");
    const res = await payAndConfirm(game.id, method);
    if (!res.ok) {
      setError(res.error);
      setSheet(null);
      return;
    }
    setSheet("done");
    setTimeout(() => {
      setSheet(null);
      setSuccess(true);
      router.refresh();
    }, 900);
  }

  if (success) {
    return <SuccessView game={game} onView={() => router.push(`/games/${game.id}`)} />;
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 pt-3">
      {/* Order summary */}
      <Card className="p-4">
        <div className="flex items-center gap-3.5">
          <DateChip date={startsAt} />
          <div>
            <p className="font-bold text-ink">{game.title}</p>
            <p className="text-sm text-ink-3">
              {formatGameDate(startsAt)} · {formatTime(startsAt)}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 border-t border-line-2 pt-3 text-sm">
          <Row label="1 × spot" value={total} />
          <Row label="Processing fee" value="$0.00" />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line-2 pt-3">
          <span className="font-bold text-ink">Total</span>
          <span className="text-lg font-bold text-ink">{total} CAD</span>
        </div>
      </Card>

      {/* Payment method */}
      <div>
        <p className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-3">
          Payment method
        </p>
        <Card className="divide-y divide-line-2 overflow-hidden">
          <MethodRow
            selected={method === "apple_pay"}
            onClick={() => setMethod("apple_pay")}
            icon={<span className="text-xs font-semibold text-white"> Pay</span>}
            iconBg="#000"
            title="Apple Pay"
            sub="Fastest · Face ID"
          />
          <MethodRow
            selected={method === "card"}
            onClick={() => setMethod("card")}
            icon={<span className="text-[9px] font-bold italic text-white">VISA</span>}
            iconBg="#1A1F71"
            title="Visa ·· 4242"
            sub="Saved card"
          />
          <button className="flex w-full items-center gap-3 p-4 text-left">
            <span className="flex h-6.5 w-9.5 items-center justify-center rounded-md bg-brand-50">
              <Plus className="size-4 text-brand-600" />
            </span>
            <span className="font-semibold text-brand-700">Add a card</span>
          </button>
        </Card>
        <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-ink-3">
          <Lock className="size-3" />
          Payments processed securely. We never store your card details.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          {error}
        </div>
      )}

      {/* Pay button */}
      {method === "apple_pay" ? (
        <button
          data-testid="pay-btn"
          onClick={() => setSheet("confirm")}
          className="flex h-13 w-full items-center justify-center gap-1.5 rounded-2xl bg-ink text-lg font-semibold text-white transition-transform active:scale-[0.98]"
        >
           Pay
        </button>
      ) : (
        <Button full size="lg" data-testid="pay-btn" onClick={() => setSheet("confirm")}>
          Pay {total}
        </Button>
      )}
      <p className="px-1 text-center text-xs text-ink-3">
        Full refund up to 24h before kickoff. No refund after.
      </p>

      {/* Apple Pay sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
            onClick={() => sheet === "confirm" && setSheet(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-9 shadow-pop"
            >
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
                 Pay
              </div>
              <div className="mb-3 flex items-center gap-3 rounded-xl ring-1 ring-line p-3">
                <span className="flex h-6.5 w-9.5 items-center justify-center rounded-md bg-[#1A1F71] text-[9px] font-bold italic text-white">
                  VISA
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">Visa Debit</p>
                  <p className="text-xs text-ink-3">·· 4242</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line-2 py-3">
                <span className="font-bold text-ink">Total</span>
                <span className="font-bold text-ink">{total} CAD</span>
              </div>

              <div className="flex min-h-[64px] items-center justify-center pt-2">
                {sheet === "confirm" && (
                  <button
                    data-testid="confirm-pay"
                    onClick={confirm}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink font-semibold text-white"
                  >
                    <ScanFace className="size-5" /> Confirm with Face ID
                  </button>
                )}
                {sheet === "processing" && (
                  <div className="flex flex-col items-center gap-2 text-ink-2">
                    <Loader2 className="size-7 animate-spin text-ink" />
                    <span className="text-sm">Processing…</span>
                  </div>
                )}
                {sheet === "done" && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-ok text-white">
                      <Check className="size-7" strokeWidth={3} />
                    </span>
                    <span className="font-semibold text-ok">Done</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessView({
  game,
  onView,
}: {
  game: { title: string };
  onView: () => void;
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
          Your spot for <span className="font-semibold text-ink">{game.title}</span>{" "}
          is confirmed and paid.
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
          <MiniAction icon={<CalendarPlus className="size-5" />} label="Calendar" />
          <MiniAction icon={<MapPin className="size-5" />} label="Directions" />
          <MiniAction icon={<Share2 className="size-5" />} label="Share" />
        </div>
        <Button full size="lg" onClick={onView}>
          View registration
        </Button>
      </motion.div>
    </div>
  );
}

function MiniAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface py-3 text-xs font-medium text-ink-2 ring-1 ring-line">
      <span className="text-brand-600">{icon}</span>
      {label}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-2">
      <span>{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function MethodRow({
  selected,
  onClick,
  icon,
  iconBg,
  title,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 p-4 text-left">
      <span
        className="flex h-6.5 w-9.5 items-center justify-center rounded-md"
        style={{ background: iconBg }}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-3">{sub}</p>
      </div>
      <span
        className={
          "flex size-5.5 items-center justify-center rounded-full border-2 " +
          (selected ? "border-brand-600" : "border-line")
        }
      >
        {selected && <span className="size-2.5 rounded-full bg-brand-600" />}
      </span>
    </button>
  );
}
