// Runs before `next build`. On Vercel production builds, apply pending Prisma
// migrations so new code never runs against an old schema. Preview and local
// builds skip this so they can't migrate a shared production database.
// Opt out with SKIP_DEPLOY_MIGRATIONS=true (e.g. if you migrate from CI).
import { spawnSync } from "node:child_process";

const isProductionDeploy = process.env.VERCEL_ENV === "production";
if (!isProductionDeploy || process.env.SKIP_DEPLOY_MIGRATIONS === "true") {
  process.exit(0);
}

console.log("Applying database migrations (Vercel production build)…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(result.status ?? 1);
