import { spawn } from "node:child_process";

const port = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

function cleanEnv(env) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([key, value]) => value !== undefined && !key.startsWith("="),
    ),
  );
}

const serverEnv = cleanEnv({
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? "playwright-only-secret",
  AUTH_TRUST_HOST: "true",
  DISABLE_RATE_LIMITS: "true",
  HOSTNAME: "127.0.0.1",
  NEXTAUTH_URL: baseURL,
  NEXT_PUBLIC_APP_URL: baseURL,
  NEXT_PUBLIC_DISABLE_ANALYTICS: "true",
  PLAYWRIGHT_TEST: "true",
  PORT: port,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/kicklink?schema=public",
});

const server = spawn(process.execPath, [".next/standalone/server.js"], {
  env: serverEnv,
  stdio: "inherit",
});

function killProcessTree(child) {
  if (child.exitCode !== null || child.killed) return Promise.resolve();

  if (process.platform === "win32") {
    return new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      killer.on("exit", resolve);
      setTimeout(resolve, 2_000).unref();
    });
  }

  child.kill("SIGTERM");
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
      resolve();
    }, 2_000);
    timer.unref();
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Keep polling until the standalone server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseURL}`);
}

async function runPlaywright() {
  const child = spawn(process.execPath, ["node_modules/@playwright/test/cli.js", "test"], {
    env: {
      ...serverEnv,
      PLAYWRIGHT_BASE_URL: baseURL,
      PLAYWRIGHT_SKIP_WEBSERVER: "true",
    },
    stdio: "inherit",
  });

  return new Promise((resolve) => {
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await runPlaywright();
} finally {
  await killProcessTree(server);
}

process.exit(exitCode);
