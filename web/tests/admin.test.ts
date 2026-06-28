import test from "node:test";
import assert from "node:assert/strict";
import { adminEmails, allowAdminEmailBootstrap, isPlatformAdminUser } from "../lib/admin";

test("adminEmails parses comma-separated configured emails", () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = " Admin@KickLink.App, other@example.com ";

  assert.deepEqual(adminEmails(), ["admin@kicklink.app", "other@example.com"]);

  process.env.ADMIN_EMAILS = previous;
});

test("platformRole ADMIN grants platform admin access", () => {
  assert.equal(
    isPlatformAdminUser({
      id: "user_1",
      email: "player@kicklink.app",
      platformRole: "ADMIN",
    }),
    true
  );
});

test("ADMIN_EMAILS only grants access when explicit bootstrap flag is enabled", () => {
  const previousEmails = process.env.ADMIN_EMAILS;
  const previousBootstrap = process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP;
  process.env.ADMIN_EMAILS = "admin@kicklink.app";
  delete process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP;

  assert.equal(allowAdminEmailBootstrap(), false);
  assert.equal(
    isPlatformAdminUser({
      id: "user_1",
      email: "admin@kicklink.app",
      platformRole: "USER",
    }),
    false
  );

  process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP = "true";
  assert.equal(
    isPlatformAdminUser({
      id: "user_1",
      email: "admin@kicklink.app",
      platformRole: "USER",
    }),
    true
  );

  process.env.ADMIN_EMAILS = previousEmails;
  process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP = previousBootstrap;
});
