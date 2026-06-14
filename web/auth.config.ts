import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration (no database or bcrypt here). Shared between
// the middleware (edge) and the full auth setup (node).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Persist id onto the token at sign-in.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Expose id on the session for server components.
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // added in auth.ts (node runtime)
} satisfies NextAuthConfig;
