"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { joinClubSchema, createClubSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

const PALETTE = ["#6E3BD8", "#2666D6", "#12915A", "#D85A18", "#C2185B", "#0E8A86"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

function inviteCodeFrom(name: string) {
  const base = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() || "CLUB";
  return base + Math.floor(100 + Math.random() * 900);
}

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

export type CreateClubState = { error?: string } | undefined;

export async function createClub(
  _prev: CreateClubState,
  formData: FormData
): Promise<CreateClubState> {
  const user = await requireUser();
  if (!user.organizerApproved) {
    return { error: "Organizer approval is required before creating a club." };
  }

  const parsed = createClubSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { name, city, venue, blurb } = parsed.data;

  // Unique handle.
  let handle = slugify(name);
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? handle : `${handle}-${i}`;
    const taken = await db.organization.findUnique({ where: { handle: candidate } });
    if (!taken) {
      handle = candidate;
      break;
    }
  }

  // Unique invite code.
  let inviteCode = inviteCodeFrom(name);
  while (await db.organization.findUnique({ where: { inviteCode } })) {
    inviteCode = inviteCodeFrom(name);
  }

  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

  await db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        handle,
        city,
        venue: venue ?? "",
        blurb: blurb ?? "",
        color,
        inviteCode,
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "ORGANIZER" } },
      },
      select: { id: true, name: true, handle: true, city: true },
    });

    await writeAuditLog(
      {
        action: "ORGANIZATION_CREATED",
        actorId: user.id,
        targetType: "Organization",
        targetId: org.id,
        organizationId: org.id,
        metadata: {
          name: org.name,
          handle: org.handle,
          city: org.city,
        },
      },
      tx
    );
  });

  revalidatePath("/clubs");
  revalidatePath("/manage");
  revalidatePath("/admin/audit");
  redirect(`/clubs/${handle}`);
}
