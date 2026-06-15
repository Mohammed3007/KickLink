"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validators";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your profile details.",
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      city: parsed.data.city,
      skill: parsed.data.skill,
      avatarColor: parsed.data.avatarColor,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/games");
  revalidatePath("/clubs");
  return { ok: true };
}
