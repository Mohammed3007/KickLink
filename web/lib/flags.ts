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
