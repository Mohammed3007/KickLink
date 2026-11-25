import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { expect, test as base } from "@playwright/test";

const databaseUrl = process.env.TEST_DATABASE_URL;

type GameFixture = {
  email: string;
  gameId: string;
  registrationId: string;
  pool: Pool;
};

const test = base.extend<{ gameFixture: GameFixture }>({
  gameFixture: async ({}, runFixture) => {
    // Use the wire driver here: Playwright's CommonJS transform cannot load
    // Prisma's generated ESM client. App-side code still uses Prisma normally.
    const pool = new Pool({ connectionString: databaseUrl, options: "-c timezone=UTC" });
    const suffix = randomUUID();
    const userId = randomUUID();
    const orgId = randomUUID();
    const gameId = randomUUID();
    const registrationId = randomUUID();
    const email = `e2e-${suffix}@example.test`;
    try {
      await pool.query(
        'INSERT INTO "User" (id, email, name, "passwordHash", "emailVerified") VALUES ($1, $2, $3, $4, now())',
        [userId, email, "Payment tester", await bcrypt.hash("test-password", 4)]
      );
      await pool.query(
        'INSERT INTO "Organization" (id, name, handle, "ownerId", "inviteCode") VALUES ($1, $2, $3, $4, $5)',
        [orgId, "Payment test club", `e2e-${suffix}`, userId, suffix]
      );
      await pool.query('INSERT INTO "Membership" (id, "userId", "orgId") VALUES ($1, $2, $3)', [randomUUID(), userId, orgId]);
      await pool.query(
        'INSERT INTO "Game" (id, "orgId", title, venue, "startsAt", model, "priceCents", capacity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [gameId, orgId, "Payment test game", "Test field", new Date(Date.now() + 3 * 86_400_000).toISOString(), "PAY", 1500, 2]
      );
      await pool.query(
        'INSERT INTO "Registration" (id, "userId", "gameId", status, "payStatus", "offerExpiresAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, now())',
        [registrationId, userId, gameId, "PROVISIONAL", "UNPAID", new Date(Date.now() + 36 * 60_000).toISOString()]
      );
      await runFixture({ email, gameId, registrationId, pool });
    } finally {
      await pool.query('DELETE FROM "Organization" WHERE id = $1', [orgId]);
      await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
      await pool.end();
    }
  },
});

test.skip(!databaseUrl, "Requires TEST_DATABASE_URL pointing at a disposable migrated Postgres database.");

for (const outcome of ["paid", "cancelled", "refunded"] as const) {
  test(`payment screen refreshes a delayed ${outcome} result`, async ({ page, gameFixture }) => {
    await page.route("**/api/analytics/track", (route) => route.fulfill({ status: 202, body: "{}" }));
    await page.goto("/login");
    await page.getByLabel("Email").fill(gameFixture.email);
    await page.getByLabel("Password", { exact: true }).fill("test-password");
    await page.getByRole("button", { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/home$/);
    await page.goto(`/games/${gameFixture.gameId}/join?success=1`);
    await expect(page.getByRole("heading", { name: "Payment processing" })).toBeVisible();
    await gameFixture.pool.query(
      'UPDATE "Registration" SET status = $1, "payStatus" = $2, "offerExpiresAt" = NULL, "updatedAt" = now() WHERE id = $3',
      [outcome === "paid" ? "CONFIRMED" : "CANCELLED", outcome === "paid" ? "PAID" : outcome === "refunded" ? "REFUNDED" : "UNPAID", gameFixture.registrationId]
    );
    await expect(page.getByRole("heading", {
      name: outcome === "paid" ? "You're in!" : outcome === "refunded" ? "Payment refunded" : "Registration cancelled",
    })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check payment status" })).toHaveCount(0);
  });
}
