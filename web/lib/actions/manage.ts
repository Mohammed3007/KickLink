"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AttendanceStatus } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createGameSchema, announcementSchema } from "@/lib/validators";
import {
  compactWaitlist,
  expireStaleHolds,
  OFFER_WINDOW_MINUTES,
  promoteWaitlist,
} from "@/lib/waitlist";
import { refundGamePayments } from "@/lib/refunds";
import { formDataToSafeObject } from "@/lib/input";
import { addWeeksInZone, parseLocalDateTime } from "@/lib/timezone";
import { APP_TIME_ZONE } from "@/lib/utils";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;


async function assertOrganizer(userId: string, orgId: string) {
  const m = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  if (m?.role !== "ORGANIZER") throw new Error("Not authorized for this club.");
}

export type FormState = { error?: string } | undefined;

export async function createGame(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const raw = safe.data;
  // price comes in as dollars from the form
  const priceCents = Math.round(parseFloat(String(raw.price || "0")) * 100);

  const parsed = createGameSchema.safeParse({ ...raw, priceCents });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const startsAt = parseLocalDateTime(parsed.data.startsAt, APP_TIME_ZONE);
  if (!startsAt) return { error: "Choose a valid start time." };
  if (startsAt <= new Date()) {
    return { error: "Choose a future start time." };
  }
  const data = { ...parsed.data, startsAt };
  const addWeeks = (date: Date, weeks: number) => addWeeksInZone(date, weeks, APP_TIME_ZONE);

  try {
    await assertOrganizer(user.id, data.orgId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized." };
  }

  const firstGame = await db.$transaction(async (tx) => {
    if (data.recurrenceMode === "WEEKLY") {
      const endsAt = addWeeks(data.startsAt, data.occurrenceCount - 1);
      const series = await tx.recurringEventSeries.create({
        data: {
          orgId: data.orgId,
          createdById: user.id,
          title: data.title,
          sport: data.sport,
          cadence: "WEEKLY",
          intervalWeeks: 1,
          occurrenceCount: data.occurrenceCount,
          startsAt: data.startsAt,
          endsAt,
          venue: data.venue,
          address: data.address ?? "",
          durationMins: data.durationMins,
          format: data.format,
          skill: data.skill,
          priceCents: data.priceCents,
          capacity: data.capacity,
          model: data.model,
          paymentMode: data.seriesPaymentMode,
        },
      });

      const games = await Promise.all(
        Array.from({ length: data.occurrenceCount }, (_, index) =>
          tx.game.create({
            data: {
              orgId: data.orgId,
              seriesId: series.id,
              occurrenceIndex: index + 1,
              title: data.title,
              sport: data.sport,
              venue: data.venue,
              address: data.address ?? "",
              startsAt: addWeeks(data.startsAt, index),
              durationMins: data.durationMins,
              format: data.format,
              skill: data.skill,
              priceCents: data.priceCents,
              capacity: data.capacity,
              model: data.model,
            },
          })
        )
      );
      return games[0];
    }

    return tx.game.create({
      data: {
        orgId: data.orgId,
        title: data.title,
        sport: data.sport,
        venue: data.venue,
        address: data.address ?? "",
        startsAt: data.startsAt,
        durationMins: data.durationMins,
        format: data.format,
        skill: data.skill,
        priceCents: data.priceCents,
        capacity: data.capacity,
        model: data.model,
      },
    });
  });

  revalidatePath("/manage");
  revalidatePath("/games");
  redirect(`/games/${firstGame.id}`);
}

export async function postAnnouncement(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = announcementSchema.safeParse(safe.data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  try {
    await assertOrganizer(user.id, parsed.data.orgId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized." };
  }

  await db.announcement.create({
    data: {
      orgId: parsed.data.orgId,
      authorId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  // Notify all members.
  const members = await db.membership.findMany({
    where: { orgId: parsed.data.orgId },
    select: { userId: true },
  });
  const org = await db.organization.findUnique({
    where: { id: parsed.data.orgId },
    select: { name: true, handle: true },
  });
  await db.notification.createMany({
    data: members
      .filter((m) => m.userId !== user.id)
      .map((m) => ({
        userId: m.userId,
        kind: "ANNOUNCE" as const,
        title: org?.name ?? "Club update",
        body: parsed.data.title,
        href: `/clubs/${org?.handle}`,
      })),
  });

  revalidatePath("/manage");
  revalidatePath(`/clubs/${org?.handle}`);
  return undefined;
}

export type RosterResult = { ok: true } | { ok: false; error: string };

/**
 * Organizer marks a held (unpaid) player as paid, e.g. cash at the field.
 * Only players already holding a spot qualify, so this can't push a game
 * over capacity; waitlisted players have to be offered a spot first.
 */
export async function markPaid(registrationId: string): Promise<RosterResult> {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg) return { ok: false, error: "Registration not found." };
  await assertOrganizer(user.id, reg.game.orgId);
  if (!["PROVISIONAL", "OFFERED"].includes(reg.status) || reg.payStatus === "PAID") {
    return { ok: false, error: "Only players holding an unpaid spot can be marked paid." };
  }

  await db.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CONFIRMED", payStatus: "PAID", offerExpiresAt: null },
    });
    // No Stripe id: refunds for in-person payments are settled by the organizer.
    await tx.payment.create({
      data: {
        userId: reg.userId,
        gameId: reg.gameId,
        amountCents: reg.game.priceCents,
        method: "In person (marked by organizer)",
        status: "SUCCEEDED",
      },
    });
  });
  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}`);
  return { ok: true };
}

/** Organizer removes a player from a game, refunding any card payment in full. */
export async function removePlayer(registrationId: string): Promise<RosterResult> {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg) return { ok: false, error: "Registration not found." };
  await assertOrganizer(user.id, reg.game.orgId);
  if (reg.status === "CANCELLED") return { ok: true };

  let refunded = false;
  if (reg.payStatus === "PAID") {
    try {
      refunded = await refundGamePayments(reg.userId, reg.gameId);
    } catch (error) {
      console.error("Refund failed on removal", error);
      return { ok: false, error: "The refund didn't go through, so the player wasn't removed. Try again." };
    }
  }

  const freedSpot = ["CONFIRMED", "PROVISIONAL", "OFFERED"].includes(reg.status);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${reg.gameId} FOR UPDATE`;
    await tx.registration.update({
      where: { id: registrationId },
      data: {
        status: "CANCELLED",
        payStatus: refunded ? "REFUNDED" : reg.payStatus,
        waitlistPos: null,
        offerExpiresAt: null,
      },
    });
    if (reg.status === "WAITLISTED") await compactWaitlist(tx, reg.gameId);
    if (freedSpot) await promoteWaitlist(tx, reg.gameId);
    await tx.notification.create({
      data: {
        userId: reg.userId,
        kind: "ANNOUNCE",
        title: `Removed from ${reg.game.title}`,
        body: refunded
          ? "The organizer removed you from this game. Your payment has been refunded."
          : "The organizer removed you from this game.",
        href: `/games/${reg.gameId}`,
      },
    });
  });

  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}/participants`);
  return { ok: true };
}

export async function offerWaitlistedSpot(registrationId: string) {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg || reg.status !== "WAITLISTED") return;
  await assertOrganizer(user.id, reg.game.orgId);

  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${reg.gameId} FOR UPDATE`;
    await expireStaleHolds(tx, reg.gameId);
    const game = await tx.game.findUnique({
      where: { id: reg.gameId },
      select: { id: true, title: true, capacity: true, model: true },
    });
    if (!game) return;
    // The sweep may have already offered this player the spot.
    const current = await tx.registration.findUnique({ where: { id: registrationId } });
    if (current?.status !== "WAITLISTED") return;

    const taken = await tx.registration.count({
      where: { gameId: reg.gameId, status: { in: [...OCCUPYING] } },
    });
    if (taken >= game.capacity) return;

    await tx.registration.update({
      where: { id: registrationId },
      data: {
        status: "OFFERED",
        payStatus: game.model === "FREE" ? "FREE" : "UNPAID",
        waitlistPos: null,
        offerExpiresAt: new Date(Date.now() + OFFER_WINDOW_MINUTES * 60_000),
      },
    });
    await compactWaitlist(tx, reg.gameId);
    await tx.notification.create({
      data: {
        userId: reg.userId,
        kind: "OFFER",
        title: `A spot opened up - ${game.title}`,
        body: "You're next in line. Accept within the window to claim it.",
        href: `/games/${reg.gameId}`,
      },
    });
  });

  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}/participants`);
}

export async function recordAttendance(
  registrationId: string,
  status: AttendanceStatus
) {
  const user = await requireUser();
  if (!["PRESENT", "NO_SHOW"].includes(status)) return;

  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg) return;
  await assertOrganizer(user.id, reg.game.orgId);

  if (!["CONFIRMED", "PROVISIONAL", "OFFERED"].includes(reg.status)) {
    return;
  }

  try {
    await db.attendanceRecord.upsert({
      where: { registrationId },
      create: {
        registrationId,
        gameId: reg.gameId,
        userId: reg.userId,
        recordedById: user.id,
        status,
      },
      update: {
        status,
        recordedById: user.id,
        recordedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Attendance record failed", error);
    return;
  }

  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}/participants`);
}
