import Link from "next/link";
import { ArrowRight, CreditCard, Receipt, Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PageHeader, SectionLabel } from "@/components/app/page-header";
import { ConnectPayments } from "@/components/app/connect-payments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isStripeEnabled } from "@/lib/flags";
import { refreshConnectStatus } from "@/lib/actions/payments";
import { formatGameDate, formatPrice, formatTime } from "@/lib/utils";

export default async function ManageFinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string }>;
}) {
  const user = await requireUser();
  const stripeEnabled = isStripeEnabled();
  const { connect } = await searchParams;

  if (connect && stripeEnabled) {
    await refreshConnectStatus(connect);
  }

  const orgs = await db.organization.findMany({
    where: { memberships: { some: { userId: user.id, role: "ORGANIZER" } } },
    include: {
      games: {
        include: {
          payments: {
            include: {
              user: { select: { name: true, email: true } },
              game: { select: { title: true, startsAt: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          registrations: { select: { status: true, payStatus: true } },
        },
        orderBy: { startsAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const allPayments = orgs
    .flatMap((org) =>
      org.games.flatMap((game) =>
        game.payments.map((payment) => ({
          ...payment,
          org: { id: org.id, name: org.name, chargesEnabled: org.chargesEnabled },
          game,
        }))
      )
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const collected = allPayments
    .filter((payment) => payment.status === "SUCCEEDED")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const refunded = allPayments
    .filter((payment) => payment.status === "REFUNDED")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const pendingPlayerPayments = orgs.reduce(
    (sum, org) =>
      sum +
      org.games.reduce(
        (gameSum, game) =>
          gameSum +
          game.registrations.filter((registration) => registration.payStatus === "UNPAID").length *
            game.priceCents,
        0
      ),
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <PageHeader
        title="Finances"
        subtitle="Track player payments and payout readiness."
        action={
          <Link href="/manage">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        }
      />

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat icon={<Wallet className="size-4" />} label="Collected" value={formatPrice(collected)} />
        <Stat icon={<CreditCard className="size-4" />} label="Pending" value={formatPrice(pendingPlayerPayments)} />
        <Stat icon={<Receipt className="size-4" />} label="Refunded" value={formatPrice(refunded)} />
      </div>

      <SectionLabel>Stripe Connect</SectionLabel>
      <div className="space-y-2.5">
        {orgs.map((org) => (
          <Card key={org.id} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{org.name}</p>
                <p className="text-sm text-ink-3">
                  Payments go directly to this club&apos;s connected account once active.
                </p>
              </div>
              <Badge tone={org.chargesEnabled ? "ok" : "warn"}>
                {org.chargesEnabled ? "Active" : "Setup needed"}
              </Badge>
            </div>
            <ConnectPayments
              orgId={org.id}
              chargesEnabled={org.chargesEnabled}
              stripeEnabled={stripeEnabled}
            />
          </Card>
        ))}
      </div>

      <SectionLabel>Recent payments</SectionLabel>
      <Card className="divide-y divide-line-2">
        {allPayments.slice(0, 20).map((payment) => (
          <Link
            key={payment.id}
            href={`/games/${payment.gameId}`}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-2"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
              <Receipt className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{payment.game.title}</p>
              <p className="text-xs text-ink-3">
                {payment.user.name} · {payment.org.name} · {formatGameDate(payment.game.startsAt)}{" "}
                {formatTime(payment.game.startsAt)}
              </p>
              <p className="mt-0.5 text-xs text-ink-3">{payment.method}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-ink">{formatPrice(payment.amountCents)}</p>
              <Badge tone={payment.status === "SUCCEEDED" ? "ok" : payment.status === "FAILED" ? "bad" : "neutral"}>
                {payment.status.toLowerCase()}
              </Badge>
            </div>
            <ArrowRight className="size-4 shrink-0 text-ink-3" />
          </Link>
        ))}
        {allPayments.length === 0 && (
          <p className="p-5 text-center text-sm text-ink-3">No payments recorded yet.</p>
        )}
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </Card>
  );
}
