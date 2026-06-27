"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validators";
import { formDataToSafeObject } from "@/lib/input";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = updateProfileSchema.safeParse(safe.data);

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
