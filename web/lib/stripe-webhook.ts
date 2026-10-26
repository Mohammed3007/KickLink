import type Stripe from "stripe";

/**
 * Signing secrets for the webhook endpoint. Stripe sends platform events
 * (checkout sessions) and connected-account events (organizers' payout
 * accounts, `account.updated`) to separate endpoints, each with its own
 * secret. Both can point at /api/stripe/webhook.
 */
export function stripeWebhookSecrets(env: NodeJS.ProcessEnv = process.env) {
  return [env.STRIPE_WEBHOOK_SECRET, env.STRIPE_CONNECT_WEBHOOK_SECRET]
    .map((secret) => secret?.trim())
    .filter((secret): secret is string => Boolean(secret));
}

/** Verify a webhook against any configured secret; throws if none match. */
export function verifyStripeEvent(
  stripe: Stripe,
  body: string,
  signature: string,
  secrets: string[]
): Stripe.Event {
  let lastError: unknown = new Error("No Stripe webhook secret configured.");
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
