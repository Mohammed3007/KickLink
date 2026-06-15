"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validators";
import { avatarColor } from "@/lib/utils";
import {
  consumePasswordResetToken,
  createEmailVerificationToken,
  createPasswordResetToken,
} from "@/lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

export type AuthState =
  | { error?: string; needsVerification?: boolean; email?: string }
  | undefined;

export type SignupState =
  | { error?: string; ok?: boolean; email?: string }
  | undefined;

export type ResetState = { error?: string; ok?: boolean } | undefined;

const setupError =
  "KickLink could not reach the production database. Check DATABASE_URL in Vercel and run the Prisma migrations.";

function logAuthFailure(scope: string, error: unknown) {
  console.error(`${scope} failed`, error);
  return { error: setupError };
}

export async function authenticate(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const email = parsed.data.email.toLowerCase();

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user && user.passwordHash && !user.emailVerified) {
      return {
        error: "Please verify your email - check your inbox for the link.",
        needsVerification: true,
        email,
      };
    }

    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    return logAuthFailure("Login", error);
  }

  redirect("/home");
}

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

  try {
    const existing = await db.user.findUnique({ where: { email: normalized } });
    if (existing) {
      if (!existing.emailVerified && existing.passwordHash) {
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
  } catch (error) {
    return logAuthFailure("Signup", error);
  }
}

export async function resendVerification(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user && !user.emailVerified && user.passwordHash) {
      const token = await createEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, token);
    }
  } catch (error) {
    console.error("Resend verification failed", error);
  }
  return { ok: true };
}

export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email." };

  try {
    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (user?.passwordHash) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, token);
    }
  } catch (error) {
    return logAuthFailure("Password reset request", error);
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

  try {
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
  } catch (error) {
    return logAuthFailure("Password reset", error);
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
