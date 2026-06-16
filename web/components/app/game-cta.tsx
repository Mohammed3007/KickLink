"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeftRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  reserveSpot,
  joinWaitlist,
  acceptOffer,
  declineOffer,
  cancelRegistration,
  type ActionResult,
} from "@/lib/actions/games";

type Props = {
  gameId: string;
  model: "PAY" | "LATER" | "FREE";
  priceLabel: string;
  isFull: boolean;
  myStatus: string | null;
};

export function GameCta({ gameId, model, priceLabel, isFull, myStatus }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error);
      else router.refresh();
    });

  // Already registered states
  if (myStatus === "OFFERED") {
    const isCheckoutOffer = model === "PAY";
    return (
      <Bar error={error}>
        {isCheckoutOffer ? (
          <Button
            full
            size="lg"
            onClick={() => router.push(`/games/${gameId}/join?mode=accept`)}
          >
            Accept & pay {priceLabel}
          </Button>
        ) : (
          <Button
            full
            size="lg"
            loading={pending}
            onClick={() => run(() => acceptOffer(gameId))}
          >
            <Check className="size-4" />
            {model === "FREE" ? "Accept free spot" : "Accept spot"}
          </Button>
        )}
        <Button
          full
          size="lg"
          variant="ghost"
          loading={pending}
          onClick={() => run(() => declineOffer(gameId))}
        >
          Decline spot
        </Button>
      </Bar>
    );
  }

  if (myStatus === "PROVISIONAL") {
    return (
      <Bar error={error}>
        <Button
          full
          size="lg"
          onClick={() => router.push(`/games/${gameId}/join?mode=pay`)}
        >
          Pay {priceLabel} to confirm
        </Button>
        <CancelButton gameId={gameId} pending={pending} run={run} label="Cancel reservation" />
      </Bar>
    );
  }

  if (myStatus === "CONFIRMED") {
    return (
      <Bar error={error}>
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-ok-bg py-3 font-semibold text-ok">
          <Check className="size-5" /> You&apos;re confirmed
        </div>
        <CancelButton gameId={gameId} pending={pending} run={run} label="Cancel registration" />
      </Bar>
    );
  }

  if (myStatus === "WAITLISTED") {
    return (
      <Bar error={error}>
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-info-bg py-3 font-semibold text-info">
          <ArrowLeftRight className="size-5" /> You&apos;re on the waitlist
        </div>
        <CancelButton gameId={gameId} pending={pending} run={run} label="Leave waitlist" />
      </Bar>
    );
  }

  // Not registered
  if (isFull) {
    return (
      <Bar error={error} note="No charge to wait. You'll only pay if you accept an offered spot.">
        <Button
          full
          size="lg"
          variant="dark"
          loading={pending}
          onClick={() => run(() => joinWaitlist(gameId))}
        >
          <ArrowLeftRight className="size-4" /> Join waitlist
        </Button>
      </Bar>
    );
  }

  if (model === "FREE") {
    return (
      <Bar error={error}>
        <Button
          full
          size="lg"
          loading={pending}
          onClick={() => run(() => reserveSpot(gameId))}
        >
          <Check className="size-4" /> Reserve free spot
        </Button>
      </Bar>
    );
  }

  if (model === "LATER") {
    return (
      <Bar error={error} note="Reserve now, pay before the deadline to keep your spot.">
        <Button
          full
          size="lg"
          loading={pending}
          onClick={() => run(() => reserveSpot(gameId))}
        >
          Reserve spot · pay later
        </Button>
      </Bar>
    );
  }

  // PAY
  return (
    <Bar error={error}>
      <Button
        full
        size="lg"
        data-testid="join-btn"
        onClick={() => router.push(`/games/${gameId}/join`)}
      >
        Join · {priceLabel}
      </Button>
    </Bar>
  );
}

function CancelButton({
  gameId,
  pending,
  run,
  label,
}: {
  gameId: string;
  pending: boolean;
  run: (fn: () => Promise<ActionResult>) => void;
  label: string;
}) {
  return (
    <Button
      full
      size="lg"
      variant="ghost"
      loading={pending}
      onClick={() => run(() => cancelRegistration(gameId))}
      className="text-bad hover:bg-bad-bg"
    >
      {label}
    </Button>
  );
}

function Bar({
  children,
  error,
  note,
}: {
  children: React.ReactNode;
  error?: string | null;
  note?: string;
}) {
  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-bad-bg px-3.5 py-2.5 text-sm font-medium text-bad">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {note && <p className="px-1 text-center text-xs text-ink-3">{note}</p>}
      {children}
    </div>
  );
}
