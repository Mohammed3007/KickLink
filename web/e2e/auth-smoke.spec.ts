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
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();

  await page.goto("/forgot");
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.goto("/reset");
  await expect(page.getByRole("heading", { name: /invalid link/i })).toBeVisible();
});

test("auth pages load their assets and hydrate interactive controls", async ({ page }) => {
  const errors: string[] = [];
  const assets: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (!response.url().includes("/_next/static/")) return;
    assets.push(response.url());
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("/_next/static/")) errors.push(request.url());
  });
  await page.goto("/login");
  const password = page.getByLabel("Password", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector(".kl-auth")!).display)).toBe("flex");
  expect(assets.some((url) => url.includes(".css"))).toBe(true);
  expect(assets.some((url) => url.includes(".js"))).toBe(true);
  expect(errors).toEqual([]);
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

test("privacy policy and terms are public and linked from the landing page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^privacy$/i }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: /terms of service/i })).toBeVisible();
});
