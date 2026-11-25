"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startClubMembership, refreshClubMembership, cancelClubMembership, membershipBillingPortal, joinLeague, type MembershipResult } from "@/lib/actions/memberships";
import { formatPrice } from "@/lib/utils";

export function MembershipControls({ orgId, monthlyCents, yearlyCents, active, hasSubscription, cancelAtPeriodEnd, checkoutReturned }: {
  orgId: string; monthlyCents: number; yearlyCents: number; active: boolean;
  hasSubscription: boolean; cancelAtPeriodEnd: boolean; checkoutReturned: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  function run(action: () => Promise<MembershipResult>) {
    start(async () => {
      setError(undefined);
      const result = await action();
      if (result?.error) setError(result.error);
      else if (result?.url) window.location.assign(result.url);
      else router.refresh();
    });
  }
  useEffect(() => {
    if (!checkoutReturned || active) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      start(async () => { await refreshClubMembership(orgId); router.refresh(); });
      if (++attempts >= 20) window.clearInterval(timer);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active, checkoutReturned, orgId, router, start]);
  return <div className="space-y-3">
    {error && <p role="alert" className="text-sm text-bad">{error}</p>}
    {!active && <div className="grid gap-3 sm:grid-cols-2">
      <Button loading={pending} onClick={() => run(() => startClubMembership(orgId, "MONTHLY"))}>Join · {formatPrice(monthlyCents)}/month</Button>
      <Button loading={pending} onClick={() => run(() => startClubMembership(orgId, "YEARLY"))}>Join · {formatPrice(yearlyCents)}/year</Button>
    </div>}
    <p className="text-sm text-ink-2">Prices in CAD. Renews automatically at the selected rate. Cancel renewal at any time; access continues through your paid period. Session fees are separate.</p>
    {checkoutReturned && !active && <p role="status" className="text-sm text-ink-2">Checking your payment. Membership benefits start after payment confirmation.</p>}
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" loading={pending} onClick={() => run(() => refreshClubMembership(orgId))}>Check membership status</Button>
      {hasSubscription && <>
        <Button variant="secondary" loading={pending} onClick={() => run(() => membershipBillingPortal(orgId))}>Manage billing</Button>
        {active && <Button variant="ghost" loading={pending} onClick={() => {
          if (!cancelAtPeriodEnd && !window.confirm("Cancel automatic renewal? Your membership remains active until the end of your paid period.")) return;
          run(() => cancelClubMembership(orgId, !cancelAtPeriodEnd));
        }}>{cancelAtPeriodEnd ? "Keep renewing" : "Cancel renewal"}</Button>}
      </>}
    </div>
  </div>;
}

export function JoinLeagueButton({ leagueId, joined, active }: { leagueId: string; joined: boolean; active: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();
  return <div>
    <Button disabled={joined || !active} loading={pending} onClick={() => start(async () => {
      const result = await joinLeague(leagueId);
      if (result?.error) setError(result.error); else router.refresh();
    })}>{joined ? "Joined" : active ? "Join league" : "Membership required"}</Button>
    {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
  </div>;
}
