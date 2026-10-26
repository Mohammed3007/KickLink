"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { compactWaitlist, expireStaleHolds, promoteWaitlist } from "@/lib/waitlist";
import { isRefundable, refundGamePayments } from "@/lib/refunds";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll(gameId: string) {
  revalidatePath("/home");
  revalidatePath("/games");
  revalidatePath("/clubs");
  revalidatePath("/alerts");
  revalidatePath(`/games/${gameId}`);
}

type Loaded =
  | { ok: false; error: string }
  | { ok: true; game: NonNullable<Awaited<ReturnType<typeof db.game.findUnique>>> };

async function loadGameForUser(gameId: string, userId: string): Promise<Loaded> {
  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game) return { ok: false, error: "Game not found." };

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId: game.orgId } },
  });
  if (!membership) return { ok: false, error: "Join the club to register." };

  return { ok: true, game };
}

async function lockGameForRegistration(tx: Prisma.TransactionClient, gameId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
  const game = await tx.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error("Game not found.");
  if (game.startsAt <= new Date()) throw new Error("Registration is closed for this game.");
  return game;
}

/** Lock the game and release any lapsed holds before counting spots. */
async function lockGameAndSweep(tx: Prisma.TransactionClient, gameId: string) {
  const game = await lockGameForRegistration(tx, gameId);
  await expireStaleHolds(tx, gameId);
  return game;
}

/** Reserve a spot for FREE or pay-later (LATER) games. */
export async function reserveSpot(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const loaded = await loadGameForUser(gameId, user.id);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  try {
    await db.$transaction(async (tx) => {
      const game = await lockGameAndSweep(tx, gameId);
      if (game.model === "PAY") {
        throw new Error("This game requires payment to reserve.");
      }

      const existing = await tx.registration.findUnique({
        where: { userId_gameId: { userId: user.id, gameId } },
      });
      if (existing && existing.status !== "CANCELLED") {
        throw new Error("You're already registered.");
      }
      const taken = await tx.registration.count({
        where: { gameId, status: { in: [...OCCUPYING] } },
      });
      if (taken >= game.capacity) throw new Error("This game is full.");

      const data = {
        status: game.model === "FREE" ? ("CONFIRMED" as const) : ("PROVISIONAL" as const),
        payStatus: game.model === "FREE" ? ("FREE" as const) : ("UNPAID" as const),
        waitlistPos: null,
        offerExpiresAt: null,
      };
      await tx.registration.upsert({
        where: { userId_gameId: { userId: user.id, gameId } },
        create: { userId: user.id, gameId, ...data },
        update: data,
      });
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reserve." };
  }

  revalidateAll(gameId);
  return { ok: true };
}

/** Join the waitlist for a full game. */
export async function joinWaitlist(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const loaded = await loadGameForUser(gameId, user.id);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  try {
    await db.$transaction(async (tx) => {
      const game = await lockGameAndSweep(tx, gameId);
      const existing = await tx.registration.findUnique({
        where: { userId_gameId: { userId: user.id, gameId } },
      });
      if (existing && existing.status !== "CANCELLED") {
        throw new Error("You're already on the list.");
      }
      // A waitlist entry only moves when a spot frees up, so joining one
      // while spots are open would leave the player stuck behind them.
      const taken = await tx.registration.count({
        where: { gameId, status: { in: [...OCCUPYING] } },
      });
      if (taken < game.capacity) throw new Error("Spots are open. Reserve one instead.");
      const count = await tx.registration.count({
        where: { gameId, status: "WAITLISTED" },
      });
      const data = {
        status: "WAITLISTED" as const,
        payStatus: "UNPAID" as const,
        waitlistPos: count + 1,
      };
      await tx.registration.upsert({
        where: { userId_gameId: { userId: user.id, gameId } },
        create: { userId: user.id, gameId, ...data },
        update: data,
      });
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not join." };
  }

  revalidateAll(gameId);
  return { ok: true };
}

/**
 * Cancel a registration and promote the waitlist. Paid spots cancelled at
 * least REFUND_CUTOFF_HOURS before kickoff are refunded; later than that the
 * spot is released but the club keeps the payment, as the policy states.
 */
export async function cancelRegistration(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { userId_gameId: { userId: user.id, gameId } },
    include: { game: { select: { startsAt: true } } },
  });
  if (!reg || reg.status === "CANCELLED") return { ok: false, error: "You're not registered." };

  // Refund before releasing the spot so a failed refund leaves things as they were.
  let refunded = false;
  if (reg.payStatus === "PAID" && isRefundable(reg.game.startsAt)) {
    try {
      refunded = await refundGamePayments(user.id, gameId);
    } catch (error) {
      console.error("Refund failed on cancellation", error);
      return { ok: false, error: "We couldn't process your refund. Please try again." };
    }
  }

  const freedSpot = ["CONFIRMED", "PROVISIONAL", "OFFERED"].includes(reg.status);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    await tx.registration.update({
      where: { id: reg.id },
      data: {
        status: "CANCELLED",
        payStatus: refunded ? "REFUNDED" : reg.payStatus,
        waitlistPos: null,
        offerExpiresAt: null,
      },
    });
    if (reg.status === "WAITLISTED") await compactWaitlist(tx, gameId);
    if (freedSpot) await promoteWaitlist(tx, gameId);
  });

  revalidateAll(gameId);
  return { ok: true };
}

/** Decline an offered spot, then offer it to the next person. */
export async function declineOffer(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { userId_gameId: { userId: user.id, gameId } },
  });
  if (!reg || reg.status !== "OFFERED") {
    return { ok: false, error: "No active offer." };
  }
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    await tx.registration.update({
      where: { id: reg.id },
      data: { status: "CANCELLED", offerExpiresAt: null },
    });
    await promoteWaitlist(tx, gameId);
  });
  revalidateAll(gameId);
  return { ok: true };
}

/** Accept a free or pay-later spot offer without going through checkout. */
export async function acceptOffer(gameId: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await db.$transaction(async (tx) => {
      const game = await lockGameForRegistration(tx, gameId);
      if (game.model === "PAY") {
        throw new Error("Checkout is required for this spot.");
      }

      const reg = await tx.registration.findUnique({
        where: { userId_gameId: { userId: user.id, gameId } },
      });
      if (!reg || reg.status !== "OFFERED") {
        throw new Error("No active offer.");
      }
      if (reg.offerExpiresAt && reg.offerExpiresAt <= new Date()) {
        await tx.registration.update({
          where: { id: reg.id },
          data: { status: "CANCELLED", offerExpiresAt: null },
        });
        await promoteWaitlist(tx, gameId);
        throw new Error("This offer expired.");
      }

      await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: game.model === "FREE" ? "CONFIRMED" : "PROVISIONAL",
          payStatus: game.model === "FREE" ? "FREE" : "UNPAID",
          waitlistPos: null,
          offerExpiresAt: null,
        },
      });
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not accept offer." };
  }

  revalidateAll(gameId);
  return { ok: true };
}
