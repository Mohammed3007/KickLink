# KickLink Internal API

KickLink primarily uses Next.js server actions. Public route handlers are intentionally small.

## `POST /api/analytics/track`

Captures anonymous first-party analytics. Nothing it stores identifies a
person, which is why the site needs no cookie banner (see `lib/analytics.ts`).

- Rate limited per IP; rejects oversized bodies; sanitizes metadata.
- Drops the event (`204`) when the browser sends `Sec-GPC: 1` or looks like a bot.
- Keeps only allowlisted query parameters (`sport`, `tab`, `utm_*`, `ref`),
  so tokens in `/verify` and `/reset` links are never stored.
- Stores the referrer's host only, a device class, and country/region from
  Vercel's geo headers.
- `visitorId` is computed server-side: a hash of IP + user-agent with a random
  salt replaced daily (`AnalyticsSalt`). The raw IP and user-agent aren't kept,
  and events are never linked to accounts.
- The client skips sending when Global Privacy Control or Do Not Track is on.

Payload (`visitorId`/`sessionId` from older clients are ignored):

```json
{
  "type": "PAGE_VIEW",
  "name": "page_view",
  "path": "/games?sport=Soccer",
  "referrer": "https://www.instagram.com/",
  "title": "Games",
  "metadata": {}
}
```

Admins see the results at `/admin/analytics`.

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
- Handles `checkout.session.completed`, `checkout.session.expired`, `account.updated`,
  `invoice.paid`, `invoice.payment_failed`, and `customer.subscription.created`,
  `.updated`, and `.deleted`.
- Membership events retrieve current Stripe state and grant benefits only from a
  paid CAD invoice for the expected club, customer, subscription attempt and rate.
  Invoice IDs deduplicate renewals; delayed events cannot reduce paid-through dates.
- Ignores Checkout, invoice, and subscription events originating on a connected
  account; subscriptions are created on the platform with destination charges.
