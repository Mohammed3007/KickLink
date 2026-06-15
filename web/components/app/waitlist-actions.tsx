"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { offerWaitlistedSpot, removePlayer } from "@/lib/actions/manage";

export function WaitlistActions({
  registrationId,
  canOffer,
}: {
  registrationId: string;
  canOffer: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  if (pending) return <Loader2 className="size-4 animate-spin text-ink-3" />;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {canOffer && (
        <button
          onClick={() => run(() => offerWaitlistedSpot(registrationId))}
          className="flex items-center gap-1 rounded-lg bg-info-bg px-2.5 py-1.5 text-xs font-semibold text-info transition-opacity hover:opacity-80"
        >
          <ArrowUpRight className="size-3.5" /> Offer spot
        </button>
      )}
      <button
        onClick={() => run(() => removePlayer(registrationId))}
        aria-label="Remove waitlisted player"
        className="flex size-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-bad-bg hover:text-bad"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
