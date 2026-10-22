/**
 * Best-effort client IP for rate limiting and analytics hashing.
 *
 * On Vercel the platform overwrites `x-forwarded-for` with the real client
 * address, so its first entry is trustworthy. Elsewhere (Docker behind
 * Caddy/Nginx) the first entry is whatever the client sent, so prefer
 * `x-real-ip` from our own proxy, then the last hop it appended.
 */
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded =
    headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((part) => part.trim())
      .filter(Boolean) ?? [];
  const realIp = headers.get("x-real-ip")?.trim() || null;

  if (process.env.VERCEL) return forwarded[0] ?? realIp;
  return realIp ?? forwarded.at(-1) ?? null;
}
