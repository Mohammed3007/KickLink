import { AlertCircle, CheckCircle2, Clock3, CreditCard, ListOrdered, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, PayBadge, RegBadge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";

type RegistrationSummaryData = {
  status: string;
  payStatus: string;
  waitlistPos?: number | null;
  offerExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  registration: RegistrationSummaryData | null;
  game: {
    model: "PAY" | "LATER" | "FREE";
    startsAt: Date;
    priceCents: number;
  };
};

export function RegistrationSummary({ registration, game }: Props) {
  if (!registration) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-info">
            <Clock3 className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-ink">You have not joined this game yet</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">
              Review the details, then reserve a spot or join the waitlist if the game is full.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const isCancelled = registration.status === "CANCELLED";
  const isWaitlisted = registration.status === "WAITLISTED";
  const isOffered = registration.status === "OFFERED";
  const isProvisionallyHeld = registration.status === "PROVISIONAL";
  const paymentDue = game.model !== "FREE" && registration.payStatus === "UNPAID";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
            Your registration
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <RegBadge status={registration.status} />
            <PayBadge status={registration.payStatus} />
            {registration.waitlistPos ? (
              <Badge tone="info">#{registration.waitlistPos} waitlist</Badge>
            ) : null}
          </div>
        </div>
        <StatusIcon status={registration.status} />
      </div>

      <div className="mt-4 space-y-3 border-t border-line-2 pt-4">
        <SummaryRow
          icon={<Clock3 className="size-4" />}
          label="Joined"
          value={timeAgo(registration.createdAt)}
        />
        {registration.updatedAt.getTime() !== registration.createdAt.getTime() ? (
          <SummaryRow
            icon={isCancelled ? <XCircle className="size-4" /> : <Clock3 className="size-4" />}
            label={isCancelled ? "Cancelled" : "Last updated"}
            value={timeAgo(registration.updatedAt)}
          />
        ) : null}
        {isWaitlisted ? (
          <SummaryRow
            icon={<ListOrdered className="size-4" />}
            label="Waitlist"
            value={`Position ${registration.waitlistPos ?? "-"}`}
          />
        ) : null}
        {isOffered && registration.offerExpiresAt ? (
          <SummaryRow
            icon={<AlertCircle className="size-4" />}
            label="Offer expires"
            value={timeAgo(registration.offerExpiresAt)}
          />
        ) : null}
        {paymentDue ? (
          <SummaryRow
            icon={<CreditCard className="size-4" />}
            label={isProvisionallyHeld ? "Payment due" : "Game fee"}
            value={formatPrice(game.priceCents)}
          />
        ) : null}
      </div>

      <p className="mt-4 rounded-2xl bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-ink-2">
        {summaryText(registration.status, registration.payStatus, game.model)}
      </p>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "CONFIRMED") {
    return <CheckCircle2 className="size-6 text-ok" />;
  }
  if (status === "CANCELLED") {
    return <XCircle className="size-6 text-bad" />;
  }
  if (status === "WAITLISTED" || status === "OFFERED") {
    return <ListOrdered className="size-6 text-info" />;
  }
  return <Clock3 className="size-6 text-warn" />;
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-ink-3">{icon}</span>
      <span className="flex-1 text-ink-2">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function summaryText(status: string, payStatus: string, model: "PAY" | "LATER" | "FREE") {
  if (status === "CONFIRMED") {
    return payStatus === "PAID" || payStatus === "FREE"
      ? "Your spot is secured. If your plans change, cancel early so the organizer can fill the place."
      : "Your spot is confirmed, but payment still needs attention.";
  }
  if (status === "PROVISIONAL") {
    return model === "LATER"
      ? "Your spot is being held. Pay before the organizer deadline to keep it confirmed."
      : "Payment is needed before this spot is fully confirmed.";
  }
  if (status === "WAITLISTED") {
    return "You are on the waitlist. If a spot opens, the organizer can offer it to you from the roster.";
  }
  if (status === "OFFERED") {
    return "A spot is available for you. Accept before the offer expires, or decline so it can move to the next player.";
  }
  if (status === "CANCELLED") {
    return "This registration is cancelled. If the game still has space, you can join again.";
  }
  return "This is your current registration state for the game.";
}
