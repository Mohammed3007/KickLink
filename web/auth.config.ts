import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration (no database or bcrypt here). Shared between
// the proxy (route gate) and the full auth setup (node).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // added in auth.ts (node runtime)
} satisfies NextAuthConfig;
