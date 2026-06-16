"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AttendanceStatus, Prisma } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createGameSchema, announcementSchema } from "@/lib/validators";
import { promoteWaitlist } from "@/lib/waitlist";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

async function assertOrganizer(userId: string, orgId: string) {
  const m = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  if (m?.role !== "ORGANIZER") throw new Error("Not authorized for this club.");
}

async function compactWaitlist(gameId: string, tx: Prisma.TransactionClient) {
  const waitlist = await tx.registration.findMany({
    where: { gameId, status: "WAITLISTED" },
    orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  await Promise.all(
    waitlist.map((entry, index) =>
      tx.registration.update({
        where: { id: entry.id },
        data: { waitlistPos: index + 1 },
      })
    )
  );
}

export type FormState = { error?: string } | undefined;

export async function createGame(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData);
  // price comes in as dollars from the form
  const priceCents = Math.round(parseFloat(String(raw.price || "0")) * 100);

  const parsed = createGameSchema.safeParse({ ...raw, priceCents });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;
  if (data.startsAt <= new Date()) {
    return { error: "Choose a future start time." };
  }

  try {
    await assertOrganizer(user.id, data.orgId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Not authorized." };
  }

  const game = await db.game.create({
    data: {
      orgId: data.orgId,
      title: data.title,
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

  revalidatePath("/manage");
  revalidatePath("/games");
  redirect(`/games/${game.id}`);
}

export async function postAnnouncement(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
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

/** Organizer marks a provisional player as paid (e.g. paid in person). */
export async function markPaid(registrationId: string) {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg) return;
  await assertOrganizer(user.id, reg.game.orgId);

  await db.registration.update({
    where: { id: registrationId },
    data: { status: "CONFIRMED", payStatus: "PAID" },
  });
  revalidatePath(`/manage/games/${reg.gameId}`);
}

/** Organizer removes a player from a game. */
export async function removePlayer(registrationId: string) {
  const user = await requireUser();
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { game: true },
  });
  if (!reg) return;
  await assertOrganizer(user.id, reg.game.orgId);

  const freedSpot = ["CONFIRMED", "PROVISIONAL", "OFFERED"].includes(reg.status);
  await db.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CANCELLED", waitlistPos: null, offerExpiresAt: null },
    });
    if (reg.status === "WAITLISTED") await compactWaitlist(reg.gameId, tx);
    if (freedSpot) await promoteWaitlist(tx, reg.gameId);
  });

  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}/participants`);
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
    const game = await tx.game.findUnique({
      where: { id: reg.gameId },
      select: { id: true, title: true, capacity: true, model: true },
    });
    if (!game) return;

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
        offerExpiresAt: new Date(Date.now() + 15 * 60_000),
      },
    });
    await compactWaitlist(reg.gameId, tx);
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
