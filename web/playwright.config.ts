import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const startWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== "true";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: startWebServer
    ? {
        command: "node scripts/e2e-server.mjs",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
        env: {
          AUTH_SECRET: process.env.AUTH_SECRET ?? "playwright-only-secret",
          AUTH_TRUST_HOST: "true",
          DISABLE_RATE_LIMITS: "true",
          HOSTNAME: "127.0.0.1",
          PLAYWRIGHT_TEST: "true",
          PORT: String(port),
          NEXTAUTH_URL: baseURL,
          NEXT_PUBLIC_APP_URL: baseURL,
          NEXT_PUBLIC_DISABLE_ANALYTICS: "true",
          DATABASE_URL:
            process.env.DATABASE_URL ??
            "postgresql://postgres:postgres@127.0.0.1:5432/kicklink?schema=public",
        },
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
