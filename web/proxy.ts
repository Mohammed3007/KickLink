import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Next 16 renamed `middleware` → `proxy` (nodejs runtime).
// Optimistic auth gate only; real authorization happens in pages/actions.
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/verify",
  "/forgot",
  "/reset",
]);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.has(path);

  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/home", nextUrl));
  }

  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
