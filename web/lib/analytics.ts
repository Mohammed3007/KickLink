import { createHash } from "node:crypto";
import { z } from "zod";
import { sanitizeText } from "@/lib/input";

// Analytics are anonymous by design, so they need no consent banner: nothing
// is stored in the browser, events aren't linked to accounts, and the visitor
// hash changes every day (see visitorHash). Keep it that way when adding
// fields, and update the privacy policy if what's collected changes.

export const ANALYTICS_LIMITS = {
  maxBodyBytes: 12_000,
  maxMetadataKeys: 12,
  maxMetadataValueLength: 160,
} as const;

/**
 * Query parameters worth keeping. Everything else is dropped, so sign-in
 * tokens (/verify?token=…, /reset?token=…) and search text never reach the
 * analytics table.
 */
const ALLOWED_QUERY_KEYS = new Set([
  "sport",
  "tab",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "ref",
]);

const eventTypeSchema = z.enum(["PAGE_VIEW", "USER_EVENT"]);

const metadataValueSchema = z.union([
  z.string().transform((value) => sanitizeText(value).slice(0, ANALYTICS_LIMITS.maxMetadataValueLength)),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const metadataSchema = z
  .record(z.string().transform((key) => sanitizeText(key).slice(0, 60)), metadataValueSchema)
  .optional()
  .default({})
  .transform((value) => Object.fromEntries(Object.entries(value).slice(0, ANALYTICS_LIMITS.maxMetadataKeys)));

export const analyticsEventSchema = z.object({
  type: eventTypeSchema,
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2).max(80).regex(/^[a-z0-9_.:-]+$/i)),
  path: z
    .string()
    .transform((value) => sanitizePath(value))
    .pipe(z.string().min(1).max(500)),
  referrer: z
    .string()
    .optional()
    .default("")
    .transform((value) => sanitizeText(value).slice(0, 500)),
  title: z
    .string()
    .optional()
    .default("")
    .transform((value) => sanitizeText(value).slice(0, 160)),
  metadata: metadataSchema,
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

/** Same-site path with only the allowed query parameters. */
export function sanitizePath(path: string) {
  const cleaned = sanitizeText(path);
  if (!cleaned.startsWith("/") || cleaned.startsWith("//")) return "/";

  const [pathname, query = ""] = cleaned.split("#")[0].split("?", 2);
  const kept = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(query)) {
    if (ALLOWED_QUERY_KEYS.has(key) && value) kept.append(key, value.slice(0, 60));
  }
  const search = kept.toString();
  return `${pathname.slice(0, 400)}${search ? `?${search}` : ""}`;
}

/** The referring site's host, or "" for direct visits and our own pages. */
export function referrerHost(referrer: string, ownHost: string | null) {
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    const host = url.hostname.toLowerCase();
    return host === ownHost?.toLowerCase() ? "" : host.slice(0, 120);
  } catch {
    return "";
  }
}

export function deviceFromUserAgent(userAgent: string) {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function isBot(userAgent: string) {
  return (
    !userAgent ||
    /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|node-fetch/i.test(userAgent)
  );
}

/** True when the browser asks not to be tracked (Global Privacy Control). */
export function optedOut(headers: Headers) {
  return headers.get("sec-gpc") === "1";
}

/**
 * Anonymous per-day visitor ID: counts unique visitors for a day without
 * storing anything in the browser or keeping the IP address. The salt is
 * random and replaced daily, so the same person gets an unrelated ID tomorrow.
 */
export function visitorHash(salt: string, ip: string | null, userAgent: string) {
  return createHash("sha256")
    .update(`${salt}:${ip ?? "unknown"}:${userAgent}`)
    .digest("hex")
    .slice(0, 32);
}

/** Two-letter country and region codes from the hosting platform's geo headers. */
export function coarseLocation(headers: Headers) {
  const code = (name: string) =>
    (headers.get(name) ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  return { country: code("x-vercel-ip-country"), region: code("x-vercel-ip-country-region") };
}

export { clientIpFromHeaders } from "@/lib/client-ip";
