// Production configuration checks, run once at server start (instrumentation.ts).
// Fatal problems stop the server so a misconfigured deploy fails loudly
// instead of serving a broken or insecure app; warnings are logged.

const PLACEHOLDER_SECRETS = new Set([
  "replace-me",
  "change-me-to-a-long-random-string",
  "build-time-placeholder",
]);

export type ConfigReport = { fatal: string[]; warnings: string[] };

export function checkProductionConfig(env: NodeJS.ProcessEnv = process.env): ConfigReport {
  const fatal: string[] = [];
  const warnings: string[] = [];

  const secret = env.AUTH_SECRET?.trim() ?? "";
  if (!secret) fatal.push("AUTH_SECRET is not set.");
  else if (PLACEHOLDER_SECRETS.has(secret)) fatal.push("AUTH_SECRET is still a placeholder value.");
  else if (secret.length < 32) warnings.push("AUTH_SECRET is short; use `openssl rand -base64 32`.");

  if (!env.DATABASE_URL?.trim()) fatal.push("DATABASE_URL is not set.");

  if (!env.NEXT_PUBLIC_APP_URL?.trim() && !env.VERCEL_PROJECT_PRODUCTION_URL) {
    warnings.push("NEXT_PUBLIC_APP_URL is not set; email and Stripe links may point at the wrong host.");
  }

  if (env.STRIPE_SECRET_KEY && !env.STRIPE_WEBHOOK_SECRET) {
    fatal.push("STRIPE_SECRET_KEY is set without STRIPE_WEBHOOK_SECRET; paid spots would never confirm.");
  }
  if (!env.STRIPE_SECRET_KEY) {
    warnings.push(
      env.ALLOW_DEV_PAYMENTS === "true"
        ? "ALLOW_DEV_PAYMENTS=true: anyone can confirm paid spots without paying. Demo use only."
        : "Stripe is not configured; paid games cannot take payments."
    );
  }
  if (!env.RESEND_API_KEY) {
    warnings.push("RESEND_API_KEY is not set; verification and reset emails are only logged.");
  }
  if (!env.CRON_SECRET) {
    warnings.push("CRON_SECRET is not set; /api/cron/sweep is disabled (lapsed holds release only on page views).");
  }
  if (env.ALLOW_ADMIN_EMAIL_BOOTSTRAP === "true") {
    warnings.push("ALLOW_ADMIN_EMAIL_BOOTSTRAP=true; turn it off once a DB admin exists.");
  }

  return { fatal, warnings };
}
