import { handlers } from "@/auth";
import { endpointRateLimit } from "@/lib/api-rate-limit";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const limited = await endpointRateLimit({ scope: "auth_endpoint", req, auth: true });
  if (limited) return limited;
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const limited = await endpointRateLimit({ scope: "auth_endpoint", req, auth: true });
  if (limited) return limited;
  return handlers.POST(req);
}
