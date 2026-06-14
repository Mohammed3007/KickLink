"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, CreditCard, AlertCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateChip } from "@/components/app/date-chip";
import { createCheckout, devCompletePayment } from "@/lib/actions/payments";
import { formatPrice, formatGameDate, formatTime } from "@/lib/utils";

export function Checkout({
  game,
  stripeEnabled,
  orgChargesEnabled,
}: {
  game: {
    id: string;
    title: string;
    org: string;
    startsAt: string;
    priceCents: number;
  };
  stripeEnabled: boolean;
  orgChargesEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = formatPrice(game.priceCents);
  const startsAt = new Date(game.startsAt);

  function pay() {
    setError(null);
    start(async () => {
      if (stripeEnabled) {
        const res = await createCheckout(game.id);
        if (res.url) {
          window.location.href = res.url; // hand off to Stripe Checkout
          return;
        }
        setError(res.error ?? "Could not start checkout.");
      } else {
        const res = await devCompletePayment(game.id);
        if (res.ok) {
          router.push(`/games/${game.id}/join?success=1`);
          router.refresh();
        } else {
          setError(res.error);
        }
      }
    });
  }

  const blocked = stripeEnabled && !orgChargesEnabled;

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 pt-3">
      <Card className="p-4">
        <div className="flex items-center gap-3.5">
          <DateChip date={startsAt} />
          <div>
            <p className="font-bold text-ink">{game.title}</p>
            <p className="text-sm text-ink-3">
              {formatGameDate(startsAt)} · {formatTime(startsAt)} · {game.org}
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

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {blocked ? (
        <Card className="p-4 text-center text-sm text-ink-2">
          This club hasn&apos;t finished setting up payments yet. Check back soon.
        </Card>
      ) : stripeEnabled ? (
        <>
          <Button full size="lg" data-testid="pay-btn" loading={pending} onClick={pay}>
            <CreditCard className="size-4" /> Pay {total}
          </Button>
          <p className="flex items-center justify-center gap-1.5 px-1 text-center text-xs text-ink-3">
            <Lock className="size-3" />
            Secure checkout by Stripe · Apple&nbsp;Pay, Google&nbsp;Pay &amp; cards
          </p>
        </>
      ) : (
        <>
          <Button full size="lg" data-testid="pay-btn" loading={pending} onClick={pay}>
            Complete payment
          </Button>
          <p className="flex items-center justify-center gap-1.5 px-1 text-center text-xs text-ink-3">
            <ShieldCheck className="size-3" />
            Dev mode — set Stripe keys to take real payments (Apple/Google Pay + cards).
          </p>
        </>
      )}

      <p className="px-1 text-center text-xs text-ink-3">
        Full refund up to 24h before kickoff. No refund after.
      </p>
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
