import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// Route Neon pool queries over HTTP fetch — the correct, robust setup for
// serverless (Vercel). Avoids TCP/WebSocket pooling + prepared-statement
// issues that break the plain pg driver on Neon's pooled endpoint.
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const url = process.env.DATABASE_URL ?? "";
  // Neon (managed / production) → serverless driver. Local Postgres → pg.
  const adapter = url.includes("neon.tech")
    ? new PrismaNeon({ connectionString: url })
    : new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
