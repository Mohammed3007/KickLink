"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { requirePlatformAdminUser } from "@/lib/admin";
import { organizerApplicationSchema, organizerDecisionSchema } from "@/lib/validators";

export type OrganizerApplicationState = { error?: string; ok?: boolean } | undefined;

export async function submitOrganizerApplication(
  _prev: OrganizerApplicationState,
  formData: FormData
): Promise<OrganizerApplicationState> {
  const user = await requireUser();
  if (user.organizerApproved) {
    redirect("/manage/clubs/new");
  }

  const parsed = organizerApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the application." };
  }

  const active = await db.organizerApplication.findFirst({
    where: { userId: user.id, status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true, status: true },
  });
  if (active?.status === "APPROVED") redirect("/manage/clubs/new");
  if (active?.status === "PENDING") {
    return { ok: true };
  }

  await db.organizerApplication.create({
    data: {
      userId: user.id,
      clubName: parsed.data.clubName,
      city: parsed.data.city,
      experience: parsed.data.experience,
      expectedPlayers: parsed.data.expectedPlayers,
    },
  });

  revalidatePath("/manage/apply");
  revalidatePath("/admin/applications");
  return { ok: true };
}

export async function decideOrganizerApplication(formData: FormData) {
  const user = await requireUser();
  await requirePlatformAdminUser(user);

  const parsed = organizerDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/admin/applications");
  }

  await db.$transaction(async (tx) => {
    const application = await tx.organizerApplication.update({
      where: { id: parsed.data.applicationId },
      data: {
        status: parsed.data.decision,
        adminNote: parsed.data.adminNote,
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
      select: { userId: true },
    });

    if (parsed.data.decision === "APPROVED") {
      await tx.user.update({
        where: { id: application.userId },
        data: { organizerApproved: true },
      });
    }
  });

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
