export const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/verify",
  "/forgot",
  "/reset",
]);

export function safeInternalPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return "/home";
  return path;
}

export function getAuthRouteRedirect(path: string, isLoggedIn: boolean) {
  const isPublic = PUBLIC_ROUTES.has(path);

  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    return "/home";
  }

  if (!isLoggedIn && !isPublic) {
    return `/login?from=${encodeURIComponent(safeInternalPath(path))}`;
  }

  return null;
}
