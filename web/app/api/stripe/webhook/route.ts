import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { confirmPaidRegistration } from "@/lib/payment-confirm";
import { refundPayment } from "@/lib/refunds";
import { CHECKOUT_HOLD_MINUTES, CHECKOUT_SESSION_MINUTES, promoteWaitlist } from "@/lib/waitlist";
import { readLimitedText, REQUEST_LIMITS } from "@/lib/input";

export async function POST(req: Request) {
  // Not IP rate limited: Stripe delivers from a small set of shared IPs, and
  // throttling them would delay payment confirmations. The signature check
  // below rejects anything that isn't from Stripe.
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const limitedBody = await readLimitedText(req, REQUEST_LIMITS.maxWebhookBytes);
  if (!limitedBody.ok) {
    return NextResponse.json({ error: limitedBody.error }, { status: 413 });
  }
  const body = limitedBody.text;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const gameId = session.metadata?.gameId;
      if (userId && gameId && session.payment_status === "paid") {
        const result = await confirmPaidRegistration({
          userId,
          gameId,
          amountCents: session.amount_total ?? 0,
          method: "Card · Stripe",
          stripeId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : undefined,
          stripeSessionId: session.id,
        });
        if (result.paymentId) {
          // Paid for a spot that's gone (refundDue); give the money back. A
          // throw returns 500 so Stripe retries, and the refund is idempotent.
          const payment = await db.payment.findUnique({ where: { id: result.paymentId } });
          if (payment?.refundDue) await refundPayment(payment);
        }
        revalidatePath("/home");
        revalidatePath("/games");
        revalidatePath("/profile");
        revalidatePath(`/games/${gameId}`);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const gameId = session.metadata?.gameId;
      if (userId && gameId) {
        await db.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
          const released = await tx.registration.updateMany({
            where: {
              userId,
              gameId,
              status: "PROVISIONAL",
              payStatus: "UNPAID",
              // Only release this session's checkout hold. Pay-later
              // reservations have no expiry, and a hold renewed by a newer
              // checkout session still has most of its window left.
              offerExpiresAt: {
                not: null,
                lte: new Date(Date.now() + (CHECKOUT_HOLD_MINUTES - CHECKOUT_SESSION_MINUTES + 1) * 60_000),
              },
            },
            data: { status: "CANCELLED", waitlistPos: null, offerExpiresAt: null },
          });
          if (released.count > 0) await promoteWaitlist(tx, gameId);
        });
        revalidatePath(`/games/${gameId}`);
      }
      break;
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await db.organization.updateMany({
        where: { stripeAccountId: account.id },
        data: { chargesEnabled: !!account.charges_enabled },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
