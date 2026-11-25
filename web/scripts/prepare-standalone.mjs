import { cp } from "node:fs/promises";

// Next traces server files only. Local standalone serving also needs these
// assets so browser tests exercise the styled, hydrated application.
export async function prepareStandalone() {
  await cp("public", ".next/standalone/public", { recursive: true });
  await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
}
