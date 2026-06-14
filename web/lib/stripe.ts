import Stripe from "stripe";

let cached: Stripe | null = null;

/** Stripe client, or null when no key is configured (dev/test-flow mode). */
export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key);
  return cached;
}

export function platformFeeBps(): number {
  const v = parseInt(process.env.PLATFORM_FEE_BPS || "0", 10);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
