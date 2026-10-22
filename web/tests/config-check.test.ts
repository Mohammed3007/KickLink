import test from "node:test";
import assert from "node:assert/strict";
import { checkProductionConfig } from "../lib/config-check";

const good = {
  AUTH_SECRET: "x".repeat(44),
  DATABASE_URL: "postgresql://u:p@db/kicklink",
  NEXT_PUBLIC_APP_URL: "https://kicklink.example",
  STRIPE_SECRET_KEY: "sk_live_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  STRIPE_CONNECT_WEBHOOK_SECRET: "whsec_connect_x",
  RESEND_API_KEY: "re_x",
  CRON_SECRET: "c".repeat(32),
  NEXT_PUBLIC_LEGAL_NAME: "KickLink Inc.",
  NEXT_PUBLIC_SUPPORT_EMAIL: "support@kicklink.example",
} as unknown as NodeJS.ProcessEnv;

test("a complete production config passes cleanly", () => {
  assert.deepEqual(checkProductionConfig(good), { fatal: [], warnings: [] });
});

test("missing or placeholder secrets stop the server", () => {
  assert.equal(checkProductionConfig({ ...good, AUTH_SECRET: "" }).fatal.length, 1);
  assert.equal(checkProductionConfig({ ...good, AUTH_SECRET: "replace-me" }).fatal.length, 1);
  assert.equal(checkProductionConfig({ ...good, DATABASE_URL: undefined }).fatal.length, 1);
});

test("Stripe without a webhook secret is fatal", () => {
  const report = checkProductionConfig({ ...good, STRIPE_WEBHOOK_SECRET: undefined });
  assert.match(report.fatal.join(" "), /STRIPE_WEBHOOK_SECRET/);
});

test("risky toggles are flagged as warnings", () => {
  const report = checkProductionConfig({
    ...good,
    STRIPE_SECRET_KEY: undefined,
    STRIPE_WEBHOOK_SECRET: undefined,
    ALLOW_DEV_PAYMENTS: "true",
    ALLOW_ADMIN_EMAIL_BOOTSTRAP: "true",
  });
  assert.equal(report.fatal.length, 0);
  assert.match(report.warnings.join(" "), /ALLOW_DEV_PAYMENTS/);
  assert.match(report.warnings.join(" "), /ALLOW_ADMIN_EMAIL_BOOTSTRAP/);
});
