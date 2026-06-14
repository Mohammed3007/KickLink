import { randomBytes } from "crypto";
import { db } from "@/lib/db";

function newToken() {
  return randomBytes(32).toString("hex");
}

const HOUR = 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: string) {
  // Invalidate any previous tokens for this user.
  await db.emailVerificationToken.deleteMany({ where: { userId } });
  const token = newToken();
  await db.emailVerificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + 24 * HOUR) },
  });
  return token;
}

export async function consumeEmailVerificationToken(token: string) {
  const row = await db.emailVerificationToken.findUnique({ where: { token } });
  if (!row || row.expiresAt < new Date()) return null;
  await db.emailVerificationToken.delete({ where: { id: row.id } });
  return row.userId;
}

export async function createPasswordResetToken(userId: string) {
  await db.passwordResetToken.deleteMany({ where: { userId } });
  const token = newToken();
  await db.passwordResetToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + HOUR) },
  });
  return token;
}

export async function consumePasswordResetToken(token: string) {
  const row = await db.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.expiresAt < new Date()) return null;
  await db.passwordResetToken.delete({ where: { id: row.id } });
  return row.userId;
}
