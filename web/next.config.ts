import type { NextConfig } from "next";
import path from "node:path";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Vercel handles its own build output, so only emit a standalone bundle
// (for Docker / VPS self-hosting) when NOT building on Vercel.
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  // Repo has lockfiles at both root and web/ — pin the workspace root.
  turbopack: { root: path.join(__dirname) },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  ...(isVercel
    ? {}
    : { output: "standalone", outputFileTracingRoot: path.join(__dirname) }),
};

export default nextConfig;
