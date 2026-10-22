// Server-side feature flags derived from environment configuration.

export function isGoogleEnabled() {
  return !!(googleClientId() && googleClientSecret());
}

export function isStripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function googleClientId() {
  return process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
}

export function googleClientSecret() {
  return process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
}

/**
 * The local test-payment flow stands in for Stripe in development only.
 * In production it would let anyone confirm a paid spot without paying, so it
 * stays off unless explicitly enabled for a staging/demo deployment.
 */
export function isDevPaymentEnabled() {
  if (isStripeEnabled()) return false;
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEV_PAYMENTS === "true"
  );
}
