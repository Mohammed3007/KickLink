"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { requirePlatformAdminUser } from "@/lib/admin";
import { organizerApplicationSchema, organizerDecisionSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export type OrganizerApplicationState = { error?: string; ok?: boolean } | undefined;

export async function submitOrganizerApplication(
  formData: FormData
) {
  const user = await requireUser();
  if (user.organizerApproved) {
    redirect("/manage/clubs/new");
  }

  const parsed = organizerApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/manage/apply?error=invalid");
  }

  const active = await db.organizerApplication.findFirst({
    where: { userId: user.id, status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true, status: true },
  });
  if (active?.status === "APPROVED") redirect("/manage/clubs/new");
  if (active?.status === "PENDING") {
    redirect("/manage/apply");
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
  redirect("/manage/apply?submitted=1");
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
      select: { id: true, userId: true, clubName: true, city: true, expectedPlayers: true },
    });

    if (parsed.data.decision === "APPROVED") {
      await tx.user.update({
        where: { id: application.userId },
        data: { organizerApproved: true },
      });
    }

    await writeAuditLog(
      {
        action:
          parsed.data.decision === "APPROVED"
            ? "ORGANIZER_APPLICATION_APPROVED"
            : "ORGANIZER_APPLICATION_REJECTED",
        actorId: user.id,
        targetType: "OrganizerApplication",
        targetId: application.id,
        reason: parsed.data.adminNote || undefined,
        metadata: {
          applicantUserId: application.userId,
          clubName: application.clubName,
          city: application.city,
          expectedPlayers: application.expectedPlayers,
        },
      },
      tx
    );
  });

  revalidatePath("/admin/applications");
  revalidatePath("/admin/audit");
  redirect("/admin/applications");
}
