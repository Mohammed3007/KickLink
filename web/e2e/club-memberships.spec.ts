import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { expect, test as base, type Page } from "@playwright/test";

const databaseUrl = process.env.TEST_DATABASE_URL;
type RosFixture = { pool: Pool; userId: string; orgId: string; handle: string; email: string; openGameId: string; memberGameId: string; leagueId: string; subscriptionId: string };
const test = base.extend<{ ros: RosFixture }>({
  ros: async ({}, runFixture) => {
    const pool = new Pool({ connectionString: databaseUrl, options: "-c timezone=UTC" });
    const userId = randomUUID(), orgId = randomUUID(), handle = `ros-${randomUUID()}`;
    const email = `${userId}@example.test`, memberId = randomUUID(), subscriptionId = randomUUID();
    const openGameId = randomUUID(), memberGameId = randomUUID(), leagueId = randomUUID();
    try {
      await pool.query('INSERT INTO "User" (id,name,email,"passwordHash","emailVerified") VALUES ($1,$2,$3,$4,now())', [userId, "ROS player", email, await bcrypt.hash("test-password", 4)]);
      await pool.query('INSERT INTO "Organization" (id,name,handle,"ownerId","inviteCode","membershipEnabled") VALUES ($1,$2,$3,$4,$5,true)', [orgId, "ROS test club", handle, userId, randomUUID()]);
      await pool.query('INSERT INTO "Membership" (id,"orgId","userId","clubAccess") VALUES ($1,$2,$3,false)', [memberId, orgId, userId]);
      await pool.query('INSERT INTO "ClubSubscription" (id,"membershipId",plan,status,"paidThrough","updatedAt") VALUES ($1,$2,$3,$4,$5,now())', [subscriptionId, memberId, "MONTHLY", "active", new Date(Date.now() + 86_400_000).toISOString()]);
      await pool.query('INSERT INTO "League" (id,"orgId",name) VALUES ($1,$2,$3)', [leagueId, orgId, "ROS Winter League"]);
      for (const [id, title, access, price] of [[openGameId, "ROS open pickup", "OPEN", 1000], [memberGameId, "ROS members pickup", "MEMBERS", 0]]) {
        await pool.query('INSERT INTO "Game" (id,"orgId",title,venue,"startsAt",model,"priceCents","memberPriceCents",access,capacity) VALUES ($1,$2,$3,$4,$5,$6,1500,$7,$8,4)', [id, orgId, title, "Test field", new Date(Date.now() + 3 * 86_400_000).toISOString(), "PAY", price, access]);
      }
      await runFixture({ pool, userId, orgId, handle, email, openGameId, memberGameId, leagueId, subscriptionId });
    } finally {
      await pool.query('DELETE FROM "Organization" WHERE id=$1', [orgId]);
      await pool.query('DELETE FROM "User" WHERE id=$1', [userId]);
      await pool.end();
    }
  },
});
test.skip(!databaseUrl, "Requires a disposable migrated TEST_DATABASE_URL.");

async function login(page: Page, email: string) {
  await page.route("**/api/analytics/track", (route) => route.fulfill({ status: 202, body: "{}" }));
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/home$/);
}

for (const paid of [true, false]) {
  test(`${paid ? "paid members" : "non-members"} pay the correct open-session price`, async ({ page, ros }) => {
    if (!paid) await ros.pool.query('UPDATE "ClubSubscription" SET "paidThrough"=$1 WHERE id=$2', [new Date(Date.now() - 1000).toISOString(), ros.subscriptionId]);
    await login(page, ros.email);
    await page.goto(`/games/${ros.openGameId}`);
    await expect(page.getByText(/Members \$10.00 · Non-members \$15.00 CAD/)).toBeVisible();
    await page.getByTestId("join-btn").click();
    const amount = paid ? "10.00" : "15.00";
    await expect(page.getByText(`$${amount} CAD`, { exact: true })).toBeVisible();
    await page.getByTestId("pay-btn").click();
    await expect(page.getByRole("heading", { name: "You're in!" })).toBeVisible();
    const payment = await ros.pool.query('SELECT "amountCents" FROM "Payment" WHERE "gameId"=$1 AND "userId"=$2', [ros.openGameId, ros.userId]);
    expect(payment.rows).toEqual([{ amountCents: paid ? 1000 : 1500 }]);
    expect((await ros.pool.query('SELECT "clubAccess" FROM "Membership" WHERE "orgId"=$1 AND "userId"=$2', [ros.orgId, ros.userId])).rows[0].clubAccess).toBe(false);
  });
}

test("expired members are gated, renewing unlocks free member spots and league enrollment", async ({ page, ros }) => {
  await ros.pool.query('UPDATE "ClubSubscription" SET "paidThrough"=$1 WHERE id=$2', [new Date(Date.now() - 1000).toISOString(), ros.subscriptionId]);
  await login(page, ros.email);
  await page.goto(`/games/${ros.memberGameId}`);
  await expect(page.getByText("An active paid club membership is required for this session.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reserve free spot" })).toHaveCount(0);
  await page.goto(`/clubs/${ros.handle}/membership`);
  await expect(page.getByRole("button", { name: "Join · $5.00/month" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join · $50.00/year" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Membership required" })).toBeDisabled();
  await ros.pool.query('UPDATE "ClubSubscription" SET "paidThrough"=$1 WHERE id=$2', [new Date(Date.now() + 86_400_000).toISOString(), ros.subscriptionId]);
  await page.reload();
  await page.getByRole("button", { name: "Join league", exact: true }).click();
  await expect(page.getByRole("button", { name: "Joined", exact: true })).toBeDisabled();
  expect((await ros.pool.query('SELECT count(*)::int AS count FROM "LeagueEnrollment" WHERE "leagueId"=$1 AND "userId"=$2', [ros.leagueId, ros.userId])).rows[0].count).toBe(1);
  await page.goto(`/games/${ros.memberGameId}`);
  await page.getByRole("button", { name: "Reserve free spot" }).click();
  await expect(page.getByText("You're confirmed", { exact: false })).toBeVisible();
  const registration = await ros.pool.query('SELECT status,"payStatus","priceCents" FROM "Registration" WHERE "gameId"=$1 AND "userId"=$2', [ros.memberGameId, ros.userId]);
  expect(registration.rows).toEqual([{ status: "CONFIRMED", payStatus: "FREE", priceCents: 0 }]);
});

test("only organizers can enable memberships and create leagues", async ({ page, ros }) => {
  await ros.pool.query('UPDATE "Membership" SET role=$1 WHERE "orgId"=$2 AND "userId"=$3', ["ORGANIZER", ros.orgId, ros.userId]);
  await login(page, ros.email);
  await page.goto("/manage/memberships");
  await page.getByLabel("Monthly membership (CAD)").fill("5");
  await page.getByLabel("Yearly membership (CAD)").fill("50");
  await page.getByRole("button", { name: "Save memberships", exact: true }).click();
  await expect(page.getByText("Membership settings saved.")).toBeVisible();
  await page.getByLabel("League name", { exact: true }).fill("ROS Summer League");
  await page.getByLabel("Description", { exact: true }).fill("Weekly summer fixtures");
  await page.getByRole("button", { name: "Create members-only league" }).click();
  await expect(page.getByText("League created.")).toBeVisible();
  expect((await ros.pool.query('SELECT name FROM "League" WHERE "orgId"=$1 AND name=$2', [ros.orgId, "ROS Summer League"])).rows).toHaveLength(1);
  await ros.pool.query('UPDATE "Membership" SET role=$1 WHERE "orgId"=$2 AND "userId"=$3', ["PLAYER", ros.orgId, ros.userId]);
  await page.reload();
  await expect(page.getByLabel("Monthly membership (CAD)")).toHaveCount(0);
});

test("organizers create weekly league sessions with member access and pricing", async ({ page, ros }) => {
  await ros.pool.query('UPDATE "Membership" SET role=$1 WHERE "orgId"=$2 AND "userId"=$3', ["ORGANIZER", ros.orgId, ros.userId]);
  await login(page, ros.email);
  await page.goto("/manage/games/new");
  await page.getByLabel("Title", { exact: true }).fill("ROS recurring members");
  await page.getByLabel("Venue", { exact: true }).fill("ROS test field");
  await page.locator('input[name="startsAt"]').fill(new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 16));
  await page.getByLabel("Price ($)", { exact: true }).fill("12");
  await page.getByLabel("Session access", { exact: true }).selectOption("MEMBERS");
  await page.getByLabel("Member price (CAD)", { exact: true }).fill("7.50");
  await page.getByLabel("League (optional)", { exact: true }).selectOption(ros.leagueId);
  await page.getByLabel("Repeat", { exact: true }).selectOption("WEEKLY");
  await page.getByLabel("Occurrences", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Create game", exact: true }).click();
  await expect(page).toHaveURL((url) => /^\/games\/[^/]+$/.test(url.pathname));
  const games = await ros.pool.query('SELECT access,"priceCents","memberPriceCents","leagueId" FROM "Game" WHERE "orgId"=$1 AND title=$2', [ros.orgId, "ROS recurring members"]);
  expect(games.rows).toEqual(Array.from({ length: 2 }, () => ({ access: "MEMBERS", priceCents: 1200, memberPriceCents: 750, leagueId: ros.leagueId })));
});
