"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
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
import {
  AUTH_IP_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  checkRateLimit,
  clearRateLimit,
  rateLimitMessage,
  type RateLimitResult,
} from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { safeInternalPath } from "@/lib/auth-routes";
import { formDataToSafeObject } from "@/lib/input";

export type AuthState =
  | { error?: string; needsVerification?: boolean; email?: string }
  | undefined;

export type SignupState =
  | { error?: string; ok?: boolean; email?: string }
  | undefined;

export type ResetState = { error?: string; ok?: boolean } | undefined;

// Shown to users; the real cause is logged server-side.
const setupError = "Something went wrong on our side. Please try again in a minute.";

async function requestIp() {
  return clientIpFromHeaders(await headers()) ?? "unknown";
}

/**
 * Limit an auth form per IP and per (email, IP) pair. Keying the tight limit
 * on the pair means attempts from elsewhere can't lock the real user out.
 */
async function limitAuthForm(
  scope: string,
  email: string,
  { sendsEmail = false } = {}
): Promise<RateLimitResult> {
  const ip = await requestIp();
  if (sendsEmail) {
    // Cap mail to any one address regardless of where requests come from.
    const mailLimit = await checkRateLimit({
      scope: `${scope}_mailbox`,
      identifier: email,
      ...AUTH_RATE_LIMIT,
    });
    if (!mailLimit.ok) return mailLimit;
  }
  const ipLimit = await checkRateLimit({
    scope: `${scope}_ip`,
    identifier: ip,
    ...AUTH_IP_RATE_LIMIT,
  });
  if (!ipLimit.ok) return ipLimit;
  return checkRateLimit({
    scope,
    identifier: `${email}|${ip}`,
    ...AUTH_RATE_LIMIT,
  });
}

function logAuthFailure(scope: string, error: unknown) {
  console.error(`${scope} failed`, error);
  return { error: setupError };
}

export async function authenticate(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = signInSchema.safeParse(safe.data);
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const email = parsed.data.email.toLowerCase();

  try {
    const limit = await limitAuthForm("login_form", email);
    if (!limit.ok) return { error: rateLimitMessage(limit) };

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
    await clearRateLimit("login_form", `${email}|${await requestIp()}`);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    return logAuthFailure("Login", error);
  }

  redirect(safeInternalPath(parsed.data.returnTo ?? "/home"));
}

export async function register(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = signUpSchema.safeParse(safe.data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  try {
    const limit = await limitAuthForm("signup", normalized, { sendsEmail: true });
    if (!limit.ok) return { error: rateLimitMessage(limit) };

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
  const normalized = email.toLowerCase();
  try {
    const limit = await limitAuthForm("resend_verification", normalized, { sendsEmail: true });
    if (!limit.ok) return { ok: true };

    const user = await db.user.findUnique({ where: { email: normalized } });
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
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = forgotPasswordSchema.safeParse(safe.data);
  if (!parsed.success) return { error: "Enter a valid email." };
  const email = parsed.data.email.toLowerCase();

  try {
    const limit = await limitAuthForm("password_reset_request", email, { sendsEmail: true });
    if (!limit.ok) return { ok: true };

    const user = await db.user.findUnique({
      where: { email },
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
  const safe = formDataToSafeObject(formData);
  if (!safe.ok) return { error: safe.error };
  const parsed = resetPasswordSchema.safeParse(safe.data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your password." };
  }

  try {
    const limit = await checkRateLimit({
      scope: "password_reset_consume",
      identifier: parsed.data.token,
      ...AUTH_RATE_LIMIT,
    });
    if (!limit.ok) return { error: rateLimitMessage(limit) };

    const userId = await consumePasswordResetToken(parsed.data.token);
    if (!userId) {
      return { error: "This reset link is invalid or has expired." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await db.user.update({
      where: { id: userId },
      // Bumping sessionVersion signs out every existing session.
      data: { passwordHash, emailVerified: new Date(), sessionVersion: { increment: 1 } },
    });
    return { ok: true };
  } catch (error) {
    return logAuthFailure("Password reset", error);
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
