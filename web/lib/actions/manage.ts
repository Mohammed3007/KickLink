"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createGameSchema, announcementSchema } from "@/lib/validators";
import { promoteWaitlist } from "@/lib/waitlist";

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

  const raw = Object.fromEntries(formData);
  // price comes in as dollars from the form
  const priceCents = Math.round(parseFloat(String(raw.price || "0")) * 100);

  const parsed = createGameSchema.safeParse({ ...raw, priceCents });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;

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
    if (freedSpot) await promoteWaitlist(tx, reg.gameId);
  });

  revalidatePath(`/manage/games/${reg.gameId}`);
  revalidatePath(`/games/${reg.gameId}`);
}
