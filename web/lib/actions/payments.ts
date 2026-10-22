"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { getStripe, platformFeeBps, appUrl } from "@/lib/stripe";
import { confirmPaidRegistration } from "@/lib/payment-confirm";
import { isDevPaymentEnabled } from "@/lib/flags";
import { refundPayment } from "@/lib/refunds";
import {
  CHECKOUT_HOLD_MINUTES,
  CHECKOUT_SESSION_MINUTES,
  expireStaleHolds,
} from "@/lib/waitlist";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type CheckoutResult = { url?: string; error?: string };
export type PayResult = { ok: true } | { ok: false; error: string };

/**
 * Hold a capacity-checked spot while the player pays. Paid-game holds and
 * accepted waitlist offers expire after CHECKOUT_HOLD_MINUTES so an abandoned
 * checkout doesn't block the spot; pay-later reservations keep no expiry.
 */
async function ensureProvisionalHold(
  userId: string,
  gameId: string
): Promise<string | null> {
  try {
    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
      const game = await tx.game.findUnique({ where: { id: gameId } });
      if (!game) throw new Error("missing");
      if (game.startsAt <= new Date()) throw new Error("closed");
      await expireStaleHolds(tx, gameId);

      const holdUntil = new Date(Date.now() + CHECKOUT_HOLD_MINUTES * 60_000);
      const existing = await tx.registration.findUnique({
        where: { userId_gameId: { userId, gameId } },
      });
      if (existing?.status === "CONFIRMED") throw new Error("confirmed");
      if (existing?.status === "OFFERED" || (existing?.status === "PROVISIONAL" && existing.offerExpiresAt)) {
        // Accepted offer or retried checkout: (re)start the checkout hold.
        await tx.registration.update({
          where: { id: existing.id },
          data: { status: "PROVISIONAL", payStatus: "UNPAID", offerExpiresAt: holdUntil },
        });
        return;
      }
      if (existing?.status === "PROVISIONAL") return; // pay-later reservation

      const taken = await tx.registration.count({
        where: { gameId, status: { in: [...OCCUPYING] } },
      });
      if (taken >= game.capacity) throw new Error("full");
      const data = {
        status: "PROVISIONAL" as const,
        payStatus: "UNPAID" as const,
        waitlistPos: null,
        offerExpiresAt: game.model === "PAY" ? holdUntil : null,
      };
      await tx.registration.upsert({
        where: { userId_gameId: { userId, gameId } },
        create: { userId, gameId, ...data },
        update: data,
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "confirmed") {
      return "You're already confirmed.";
    }
    if (error instanceof Error && error.message === "closed") {
      return "Registration is closed for this game.";
    }
    if (error instanceof Error && error.message === "missing") {
      return "Game not found.";
    }
    if (error instanceof Error && error.message === "full") {
      return "This game just filled up.";
    }
    console.error("Could not hold spot for checkout", error);
    return "Could not hold your spot. Please try again.";
  }
  return null;
}

/** Create a Stripe Checkout Session (destination charge to the club). */
export async function createCheckout(gameId: string): Promise<CheckoutResult> {
  const user = await requireUser();
  const stripe = getStripe();
  if (!stripe) return { error: "dev-mode" }; // UI falls back to the test path

  const game = await db.game.findUnique({
    where: { id: gameId },
    include: { org: true },
  });
  if (!game) return { error: "Game not found." };
  if (game.startsAt <= new Date()) return { error: "Registration is closed for this game." };
  if (game.priceCents <= 0 || game.model === "FREE") {
    return { error: "This game does not require checkout." };
  }

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: game.orgId } },
  });
  if (!membership) return { error: "Join the club first." };

  if (!game.org.stripeAccountId || !game.org.chargesEnabled) {
    return { error: "This club hasn't finished setting up payments yet." };
  }

  const hold = await ensureProvisionalHold(user.id, gameId);
  if (hold) return { error: hold };

  const fee = Math.round((game.priceCents * platformFeeBps()) / 10000);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Ends before the spot hold does, so nobody pays for a released spot.
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_MINUTES * 60,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: game.priceCents,
          product_data: { name: game.title, description: game.org.name },
        },
      },
    ],
    payment_intent_data: {
      transfer_data: { destination: game.org.stripeAccountId },
      ...(fee > 0 ? { application_fee_amount: fee } : {}),
    },
    metadata: {
      userId: user.id,
      gameId,
      orgId: game.orgId,
      amountCents: String(game.priceCents),
      platformFeeCents: String(fee),
    },
    customer_email: user.email,
    success_url: `${appUrl()}/games/${gameId}/join?success=1`,
    cancel_url: `${appUrl()}/games/${gameId}`,
  });

  return { url: session.url ?? undefined };
}

/** Dev/test payment path used when Stripe isn't configured. */
export async function devCompletePayment(gameId: string): Promise<PayResult> {
  if (!isDevPaymentEnabled()) {
    return {
      ok: false,
      error: getStripe()
        ? "Use the card checkout."
        : "Online payments aren't available yet. Contact the organizer.",
    };
  }
  const user = await requireUser();
  const game = await db.game.findFirst({
    where: { id: gameId, org: { memberships: { some: { userId: user.id } } } },
  });
  if (!game) return { ok: false, error: "Game not found." };
  if (game.startsAt <= new Date()) return { ok: false, error: "Registration is closed for this game." };
  if (game.priceCents <= 0 || game.model === "FREE") {
    return { ok: false, error: "This game does not require payment." };
  }

  const hold = await ensureProvisionalHold(user.id, gameId);
  if (hold) return { ok: false, error: hold };

  const result = await confirmPaidRegistration({
    userId: user.id,
    gameId,
    amountCents: game.priceCents,
    method: "Test payment (dev)",
    stripeId: `dev_${Date.now().toString(36)}`,
  });
  if (result.status === "no_spot") {
    const payment = await db.payment.findUnique({ where: { id: result.paymentId } });
    if (payment) await refundPayment(payment);
    return { ok: false, error: "This game just filled up." };
  }

  revalidatePath("/home");
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}`);
  return { ok: true };
}

// ─── Organizer: Stripe Connect onboarding ────────────────────────
export async function connectStripe(orgId: string): Promise<CheckoutResult> {
  const user = await requireUser();
  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });
  if (membership?.role !== "ORGANIZER") return { error: "Not authorized." };

  const stripe = getStripe();
  if (!stripe) return { error: "Stripe isn't configured on this server yet." };

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return { error: "Club not found." };

  try {
    let accountId = org.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "CA",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { orgId },
      });
      accountId = account.id;
      await db.organization.update({
        where: { id: orgId },
        data: { stripeAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl()}/manage/finances?connect=${orgId}`,
      return_url: `${appUrl()}/manage/finances?connect=${orgId}`,
      type: "account_onboarding",
    });
    return { url: link.url };
  } catch (error) {
    console.error("Stripe Connect onboarding failed", error);
    const message = error instanceof Error ? error.message : "Stripe onboarding failed.";
    return { error: `Stripe setup error: ${message}` };
  }
}

/** Refresh a club's payout status from Stripe (called on return from onboarding). */
export async function refreshConnectStatus(orgId: string) {
  const user = await requireUser();
  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });
  if (membership?.role !== "ORGANIZER") return;
  const stripe = getStripe();
  if (!stripe) return;
  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org?.stripeAccountId) return;
  try {
    const account = await stripe.accounts.retrieve(org.stripeAccountId);
    await db.organization.update({
      where: { id: orgId },
      data: { chargesEnabled: !!account.charges_enabled },
    });
    revalidatePath("/manage");
    revalidatePath("/manage/finances");
  } catch (error) {
    console.error("Stripe Connect status refresh failed", error);
  }
}
