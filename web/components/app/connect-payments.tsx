"use client";

import { useState, useTransition } from "react";
import { Wallet, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { connectStripe } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";

export function ConnectPayments({
  orgId,
  chargesEnabled,
  stripeEnabled,
}: {
  orgId: string;
  chargesEnabled: boolean;
  stripeEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!stripeEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-3">
        <Wallet className="size-4" />
        Payments run in dev/test mode (no Stripe keys set on the server).
      </div>
    );
  }

  if (chargesEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-ok-bg px-3 py-2 text-sm font-medium text-ok">
        <CheckCircle2 className="size-4" />
        Payments active — payouts go to this club&apos;s Stripe account.
      </div>
    );
  }

  function go() {
    setError(null);
    start(async () => {
      const res = await connectStripe(orgId);
      if (res.url) window.location.href = res.url;
      else setError(res.error ?? "Could not start onboarding.");
    });
  }

  return (
    <div className="rounded-xl bg-warn-bg p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-warn">
        <Wallet className="size-4" /> Set up payments to charge for games
      </div>
      <p className="mt-1 text-xs text-warn/90">
        Connect a Stripe account so player payments land in your bank.
      </p>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-bad">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <Button size="sm" className="mt-2.5" loading={pending} onClick={go}>
        Connect Stripe <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}
