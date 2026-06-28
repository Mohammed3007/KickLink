# KickLink Internal API

KickLink primarily uses Next.js server actions. Public route handlers are intentionally small.

## `POST /api/analytics/track`

Captures first-party analytics events.

- Rate limited.
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

Diagnostic endpoint for uptime and database health checks. Rate limited.

## `POST /api/stripe/webhook`

Stripe webhook endpoint.

- Rate limited.
- Rejects oversized bodies.
- Requires Stripe signature verification.
- Handles `checkout.session.completed`, `checkout.session.expired` and `account.updated`.
