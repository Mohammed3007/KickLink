import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { confirmPaidRegistration } from "@/lib/payment-confirm";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
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
      if (userId && gameId) {
        await confirmPaidRegistration({
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
