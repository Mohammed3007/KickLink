import { spawn } from "node:child_process";

const child = spawn(process.execPath, [".next/standalone/server.js"], {
  env: process.env,
  stdio: "inherit",
});

let shuttingDown = false;

function stopChild() {
  if (shuttingDown) return;
  shuttingDown = true;

  if (child.exitCode !== null || child.killed) {
    process.exit(0);
  }

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    killer.on("exit", () => process.exit(0));
    setTimeout(() => process.exit(0), 2_000).unref();
    return;
  }

  child.kill("SIGTERM");
  setTimeout(() => {
    if (!child.killed) child.kill("SIGKILL");
    process.exit(0);
  }, 2_000).unref();
}

child.on("exit", (code, signal) => {
  if (shuttingDown) process.exit(0);
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

process.on("SIGINT", stopChild);
process.on("SIGTERM", stopChild);
