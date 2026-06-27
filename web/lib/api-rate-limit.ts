import { NextResponse } from "next/server";
import {
  API_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  checkRateLimit,
  requestRateLimitIdentifier,
} from "@/lib/rate-limit";

type EndpointLimitOptions = {
  scope: string;
  req: Request;
  auth?: boolean;
};

export async function endpointRateLimit({ scope, req, auth = false }: EndpointLimitOptions) {
  const config = auth ? AUTH_RATE_LIMIT : API_RATE_LIMIT;
  const limit = await checkRateLimit({
    scope,
    identifier: `${requestRateLimitIdentifier(req)}:${new URL(req.url).pathname}`,
    ...config,
  });

  if (limit.ok) return null;

  return NextResponse.json(
    { error: "Too many requests. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfterSeconds),
      },
    }
  );
}
