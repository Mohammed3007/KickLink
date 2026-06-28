import { db } from "@/lib/db";

type UserLike = {
  id: string;
  email: string;
  platformRole?: "USER" | "ADMIN";
};

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function allowAdminEmailBootstrap() {
  return process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP === "true";
}

export function isPlatformAdminUser(user: UserLike) {
  return (
    user.platformRole === "ADMIN" ||
    (allowAdminEmailBootstrap() && adminEmails().includes(user.email.toLowerCase()))
  );
}

export async function requirePlatformAdminUser(user: UserLike) {
  if (isPlatformAdminUser(user)) return user;

  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, platformRole: true },
  });

  if (!fresh || !isPlatformAdminUser(fresh)) {
    throw new Error("Not authorized.");
  }

  return fresh;
}
