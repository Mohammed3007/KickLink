"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import { avatarColor } from "@/lib/utils";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

export type AuthState =
  | { error?: string; needsVerification?: boolean; email?: string }
  | undefined;

// ─── Login ───────────────────────────────────────────────────────
export async function authenticate(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.passwordHash && !user.emailVerified) {
    return {
      error: "Please verify your email — check your inbox for the link.",
      needsVerification: true,
      email,
    };
  }

  try {
    // Verify credentials without throwing a redirect from inside signIn.
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Surface the real cause instead of a blank 500 (temporary, for debugging).
    return {
      error: "Login error: " + (error instanceof Error ? error.message : String(error)),
    };
  }

  // Success — redirect outside the try so NEXT_REDIRECT isn't swallowed.
  redirect("/home");
}

// ─── Sign up ─────────────────────────────────────────────────────
export type SignupState =
  | { error?: string; ok?: boolean; email?: string }
  | undefined;

export async function register(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    if (!existing.emailVerified && existing.passwordHash) {
      // Resend verification rather than leak that the account exists.
      const token = await createEmailVerificationToken(existing.id);
      await sendVerificationEmail(normalized, token);
      return { ok: true, email: normalized };
    }
    return { error: "That email is already registered. Try logging in." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      name,
      email: normalized,
      passwordHash,
      avatarColor: avatarColor(name),
    },
  });

  const token = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(normalized, token);
  return { ok: true, email: normalized };
}

export async function resendVerification(email: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user && !user.emailVerified && user.passwordHash) {
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);
  }
  return { ok: true };
}

// ─── Password reset ──────────────────────────────────────────────
export type ResetState = { error?: string; ok?: boolean } | undefined;

export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email." };

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  // Always report success — don't reveal whether the account exists.
  if (user?.passwordHash) {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, token);
  }
  return { ok: true };
}

export async function resetPassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your password." };
  }
  const userId = await consumePasswordResetToken(parsed.data.token);
  if (!userId) {
    return { error: "This reset link is invalid or has expired." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, emailVerified: new Date() },
  });
  return { ok: true };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
