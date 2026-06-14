import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/** The authenticated user record, or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
});

/** Require a signed-in user or redirect to login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** True if the user is an organizer of the given org. */
export async function isOrganizer(userId: string, orgId: string) {
  const m = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  return m?.role === "ORGANIZER";
}

/** Require organizer access to an org, or redirect. */
export async function requireOrganizer(orgId: string) {
  const user = await requireUser();
  if (!(await isOrganizer(user.id, orgId))) redirect("/home");
  return user;
}
