// Server-side feature flags derived from environment configuration.

export function isGoogleEnabled() {
  return !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function isStripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}
