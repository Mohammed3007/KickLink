"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { promoteWaitlist } from "@/lib/waitlist";

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

/** Reserve a spot for FREE or pay-later (LATER) games. */
export async function reserveSpot(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const loaded = await loadGameForUser(gameId, user.id);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  try {
    await db.$transaction(async (tx) => {
      const game = await lockGameForRegistration(tx, gameId);
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
      await lockGameForRegistration(tx, gameId);
      const existing = await tx.registration.findUnique({
        where: { userId_gameId: { userId: user.id, gameId } },
      });
      if (existing && existing.status !== "CANCELLED") {
        throw new Error("You're already on the list.");
      }
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

/** Cancel a registration; refund if paid, then promote the waitlist. */
export async function cancelRegistration(gameId: string): Promise<ActionResult> {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { userId_gameId: { userId: user.id, gameId } },
  });
  if (!reg) return { ok: false, error: "You're not registered." };

  const freedSpot = ["CONFIRMED", "PROVISIONAL", "OFFERED"].includes(reg.status);

  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    if (!(await tx.game.findUnique({ where: { id: gameId } }))) {
      throw new Error("Game not found.");
    }
    const refunding = reg.payStatus === "PAID";
    await tx.registration.update({
      where: { id: reg.id },
      data: {
        status: "CANCELLED",
        payStatus: refunding ? "REFUNDED" : reg.payStatus,
        waitlistPos: null,
        offerExpiresAt: null,
      },
    });
    if (refunding) {
      await tx.payment.updateMany({
        where: { userId: user.id, gameId, status: "SUCCEEDED" },
        data: { status: "REFUNDED" },
      });
    }
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
