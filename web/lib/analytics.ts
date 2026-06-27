import { createHash } from "node:crypto";
import { z } from "zod";
import { sanitizeText } from "@/lib/input";

export const ANALYTICS_LIMITS = {
  maxBodyBytes: 12_000,
  maxMetadataKeys: 12,
  maxMetadataValueLength: 160,
} as const;

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
  visitorId: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(8).max(80).regex(/^[a-zA-Z0-9_.:-]+$/)),
  sessionId: z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value ? sanitizeText(value).slice(0, 80) : null)),
  metadata: metadataSchema,
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

export function sanitizePath(path: string) {
  const cleaned = sanitizeText(path);
  if (!cleaned.startsWith("/") || cleaned.startsWith("//")) return "/";
  return cleaned.slice(0, 500);
}

export function hashIp(value: string | null, salt = process.env.AUTH_SECRET ?? "kicklink-dev") {
  if (!value) return null;
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

export function clientIpFromHeaders(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    null
  );
}
