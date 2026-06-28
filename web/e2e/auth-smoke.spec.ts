import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/analytics/track", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, skipped: true }),
    });
  });
});

test("marketing page exposes primary auth paths", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /lock the\s*lineup before\s*kickoff/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /get started free/i })).toHaveAttribute(
    "href",
    "/signup",
  );
  await expect(page.getByRole("link", { name: /^log in$/i }).first()).toHaveAttribute(
    "href",
    "/login",
  );
});

test("auth pages render usable forms", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  await page.goto("/forgot");
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.goto("/reset");
  await expect(page.getByRole("heading", { name: /invalid link/i })).toBeVisible();
});

test("protected app routes redirect signed-out users with a safe return path", async ({
  page,
}) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login\?from=%2Fhome$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

  await page.goto("/manage");
  await expect(page).toHaveURL(/\/login\?from=%2Fmanage$/);
});
