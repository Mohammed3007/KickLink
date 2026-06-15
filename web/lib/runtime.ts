export function publicAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return normalizeUrl(explicit);

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ?? process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeUrl(vercelUrl);

  return "http://localhost:3000";
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function normalizeUrl(value: string) {
  const withProtocol = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}
