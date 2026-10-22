import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { avatarColor } from "@/lib/utils";
import {
  AUTH_ACCOUNT_RATE_LIMIT,
  AUTH_IP_RATE_LIMIT,
  checkRateLimit,
  clearRateLimit,
} from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { googleClientId, googleClientSecret } from "@/lib/flags";

// Google is only enabled when credentials are configured.
const googleId = googleClientId();
const googleSecret = googleClientSecret();
const googleEnabled = !!(googleId && googleSecret);

const credentials = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  // This is the enforcement point for every password check, including direct
  // POSTs to /api/auth/callback/credentials that skip the login form.
  async authorize(creds, request) {
    const parsed = signInSchema.safeParse(creds);
    if (!parsed.success) return null;

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const ip = clientIpFromHeaders(request.headers) ?? "unknown";
    const ipLimit = await checkRateLimit({
      scope: "credentials_ip",
      identifier: ip,
      ...AUTH_IP_RATE_LIMIT,
    });
    if (!ipLimit.ok) return null;
    const limit = await checkRateLimit({
      scope: "credentials_login",
      identifier: normalizedEmail,
      ...AUTH_ACCOUNT_RATE_LIMIT,
    });
    if (!limit.ok) return null;

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user?.passwordHash) return null; // no password (OAuth-only) or no user
    if (!user.emailVerified) return null; // must verify first

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    await clearRateLimit("credentials_login", normalizedEmail);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      sessionVersion: user.sessionVersion,
    };
  },
});

const providers = googleEnabled
  ? [
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      }),
      credentials,
    ]
  : [credentials];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Upsert OAuth users into our own schema so memberships/registrations work.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;
      // Only trust addresses Google itself has verified.
      if (profile?.email_verified !== true) return false;

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        // An unverified password account was never proven to belong to this
        // mailbox owner (anyone can sign up with someone else's address), so
        // drop that password before Google proves ownership and links it.
        const unverifiedPassword = !existing.emailVerified && !!existing.passwordHash;
        const updated = await db.user.update({
          where: { id: existing.id },
          data: {
            emailVerified: existing.emailVerified ?? new Date(),
            image: existing.image ?? user.image ?? null,
            ...(unverifiedPassword
              ? { passwordHash: null, sessionVersion: { increment: 1 } }
              : {}),
          },
        });
        if (unverifiedPassword) {
          await db.emailVerificationToken.deleteMany({ where: { userId: existing.id } });
          await db.passwordResetToken.deleteMany({ where: { userId: existing.id } });
        }
        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: existing.id,
            provider: "google",
            providerAccountId: account.providerAccountId,
          },
          update: {},
        });
        user.id = existing.id;
        (user as { sessionVersion?: number }).sessionVersion = updated.sessionVersion;
      } else {
        const created = await db.user.create({
          data: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image ?? null,
            emailVerified: new Date(),
            avatarColor: avatarColor(user.name ?? email),
            accounts: {
              create: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
          },
        });
        user.id = created.id;
      }
      return true;
    },
  },
});
