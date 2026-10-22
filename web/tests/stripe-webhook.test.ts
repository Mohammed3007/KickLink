import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { stripeWebhookSecrets, verifyStripeEvent } from "../lib/stripe-webhook";

const stripe = new Stripe("sk_test_unit");
const platformSecret = "whsec_platform_test";
const connectSecret = "whsec_connect_test";

function signed(secret: string, type: string) {
  const payload = JSON.stringify({ id: "evt_test", object: "event", type, data: { object: {} } });
  return { payload, header: stripe.webhooks.generateTestHeaderString({ payload, secret }) };
}

test("events signed with either endpoint's secret verify", () => {
  const secrets = [platformSecret, connectSecret];
  const platform = signed(platformSecret, "checkout.session.completed");
  const connect = signed(connectSecret, "account.updated");
  assert.equal(verifyStripeEvent(stripe, platform.payload, platform.header, secrets).type, "checkout.session.completed");
  assert.equal(verifyStripeEvent(stripe, connect.payload, connect.header, secrets).type, "account.updated");
});

test("events signed with an unknown secret are rejected", () => {
  const forged = signed("whsec_attacker", "checkout.session.completed");
  assert.throws(() => verifyStripeEvent(stripe, forged.payload, forged.header, [platformSecret, connectSecret]));
  assert.throws(() => verifyStripeEvent(stripe, forged.payload, forged.header, []));
});

test("secrets list skips unset and blank values", () => {
  assert.deepEqual(
    stripeWebhookSecrets({ STRIPE_WEBHOOK_SECRET: " whsec_a ", STRIPE_CONNECT_WEBHOOK_SECRET: "" } as unknown as NodeJS.ProcessEnv),
    ["whsec_a"]
  );
});
