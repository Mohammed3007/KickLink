import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;

  const { checkProductionConfig } = await import("@/lib/config-check");
  const { fatal, warnings } = checkProductionConfig();
  for (const warning of warnings) {
    console.warn(JSON.stringify({ level: "warn", msg: "config", detail: warning }));
  }
  if (fatal.length > 0) {
    for (const problem of fatal) {
      console.error(JSON.stringify({ level: "error", msg: "config", detail: problem }));
    }
    throw new Error(`KickLink is misconfigured: ${fatal.join(" ")}`);
  }
}

// One JSON line per unhandled server error, so log drains and alerting
// (Vercel log drains, Better Stack, Datadog, ...) can match on msg.
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      msg: "unhandled_server_error",
      name: err.name,
      message: err.message,
      digest,
      method: request.method,
      path: request.path.split("?")[0],
      routePath: context.routePath,
      routeType: context.routeType,
      stack: err.stack?.split("\n").slice(0, 8).join("\n"),
    })
  );
};
