import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { avatarColor } from "@/lib/utils";

// Google is only enabled when credentials are configured.
const googleEnabled = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

const credentials = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(creds) {
    const parsed = signInSchema.safeParse(creds);
    if (!parsed.success) return null;

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user?.passwordHash) return null; // no password (OAuth-only) or no user
    if (!user.emailVerified) return null; // must verify first

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    return { id: user.id, email: user.email, name: user.name, image: user.image };
  },
});

const providers = googleEnabled
  ? [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        // Link the Google account + mark verified if not already.
        await db.user.update({
          where: { id: existing.id },
          data: {
            emailVerified: existing.emailVerified ?? new Date(),
            image: existing.image ?? user.image ?? null,
          },
        });
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
