import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { getAuthRouteRedirect } from "@/lib/auth-routes";

// Optimistic auth gate only; real authorization happens in pages/actions.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const redirectPath = getAuthRouteRedirect(nextUrl.pathname, !!req.auth);

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
