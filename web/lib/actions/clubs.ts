"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { joinClubSchema } from "@/lib/validators";

export type JoinClubState = { error?: string; ok?: boolean; handle?: string } | undefined;

export async function joinClub(
  _prev: JoinClubState,
  formData: FormData
): Promise<JoinClubState> {
  const user = await requireUser();
  const parsed = joinClubSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid invite code." };

  const code = parsed.data.code.trim().toUpperCase();
  const org = await db.organization.findFirst({
    where: { inviteCode: { equals: code, mode: "insensitive" } },
  });
  if (!org) return { error: "No club found for that code." };

  const existing = await db.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
  });
  if (existing) return { error: "You're already in this club." };

  await db.membership.create({
    data: { userId: user.id, orgId: org.id, role: "PLAYER" },
  });

  revalidatePath("/clubs");
  revalidatePath("/home");
  return { ok: true, handle: org.handle };
}
