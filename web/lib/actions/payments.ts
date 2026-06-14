"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { getStripe, platformFeeBps, appUrl } from "@/lib/stripe";
import { confirmPaidRegistration } from "@/lib/payment-confirm";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type CheckoutResult = { url?: string; error?: string };
export type PayResult = { ok: true } | { ok: false; error: string };

/** Hold a capacity-checked spot for the user unless they already have one. */
async function ensureProvisionalHold(
  userId: string,
  gameId: string,
  capacity: number
): Promise<string | null> {
  const existing = await db.registration.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (existing?.status === "CONFIRMED") return "You're already confirmed.";
  const holds =
    existing && ["PROVISIONAL", "OFFERED"].includes(existing.status);
  if (holds) return null;

  try {
    await db.$transaction(async (tx) => {
      const taken = await tx.registration.count({
        where: { gameId, status: { in: [...OCCUPYING] } },
      });
      if (taken >= capacity) throw new Error("full");
      await tx.registration.upsert({
        where: { userId_gameId: { userId, gameId } },
        create: { userId, gameId, status: "PROVISIONAL", payStatus: "UNPAID" },
        update: { status: "PROVISIONAL", payStatus: "UNPAID" },
      });
    });
  } catch {
    return "This game just filled up.";
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

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: game.orgId } },
  });
  if (!membership) return { error: "Join the club first." };

  if (!game.org.stripeAccountId || !game.org.chargesEnabled) {
    return { error: "This club hasn't finished setting up payments yet." };
  }

  const hold = await ensureProvisionalHold(user.id, gameId, game.capacity);
  if (hold) return { error: hold };

  const fee = Math.round((game.priceCents * platformFeeBps()) / 10000);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
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
    metadata: { userId: user.id, gameId },
    customer_email: user.email,
    success_url: `${appUrl()}/games/${gameId}/join?success=1`,
    cancel_url: `${appUrl()}/games/${gameId}`,
  });

  return { url: session.url ?? undefined };
}

/** Dev/test payment path used when Stripe isn't configured. */
export async function devCompletePayment(gameId: string): Promise<PayResult> {
  if (getStripe()) {
    return { ok: false, error: "Use the card checkout." };
  }
  const user = await requireUser();
  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game) return { ok: false, error: "Game not found." };

  const hold = await ensureProvisionalHold(user.id, gameId, game.capacity);
  if (hold) return { ok: false, error: hold };

  await confirmPaidRegistration({
    userId: user.id,
    gameId,
    amountCents: game.priceCents,
    method: "Test payment (dev)",
    stripeId: `dev_${Date.now().toString(36)}`,
  });

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

  let accountId = org.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
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
    refresh_url: `${appUrl()}/manage?connect=${orgId}`,
    return_url: `${appUrl()}/manage?connect=${orgId}`,
    type: "account_onboarding",
  });
  return { url: link.url };
}

/** Refresh a club's payout status from Stripe (called on return from onboarding). */
export async function refreshConnectStatus(orgId: string) {
  const stripe = getStripe();
  if (!stripe) return;
  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org?.stripeAccountId) return;
  const account = await stripe.accounts.retrieve(org.stripeAccountId);
  await db.organization.update({
    where: { id: orgId },
    data: { chargesEnabled: !!account.charges_enabled },
  });
  revalidatePath("/manage");
}
