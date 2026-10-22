# KickLink Internal API

KickLink primarily uses Next.js server actions. Public route handlers are intentionally small.

## `POST /api/analytics/track`

Captures first-party analytics events.

- Not IP rate limited (Stripe sends from shared IPs); the signature check gates it.
- Rejects oversized bodies.
- Sanitizes metadata.
- Links to the logged-in user server-side when available.
- Stores hashed IP, not raw IP.

Payload:

```json
{
  "type": "PAGE_VIEW",
  "name": "page_view",
  "path": "/games",
  "referrer": "https://kick-link.vercel.app/",
  "title": "Games",
  "visitorId": "anonymous-id",
  "sessionId": "session-id",
  "metadata": {}
}
```

## `GET /api/health`

Uptime probe. Returns `200 {"ok":true,"db":"ok"}` when the database is
reachable, otherwise `503 {"ok":false,"db":"unreachable"}`. No configuration
or error details are exposed. Rate limited per IP.

## `POST /api/stripe/webhook`

Stripe webhook endpoint.

- Not IP rate limited (Stripe sends from shared IPs); the signature check gates it.
- Rejects oversized bodies.
- Requires Stripe signature verification against `STRIPE_WEBHOOK_SECRET`
  (platform endpoint) or `STRIPE_CONNECT_WEBHOOK_SECRET` (connected-accounts endpoint).
- Handles `checkout.session.completed`, `checkout.session.expired` and `account.updated`.
- Ignores checkout events that originate on a connected account.
