# KickLink — web app

Pickup-soccer club management: private clubs, games, payments, waitlists and
spot transfers. Next.js 16 (App Router) · Postgres + Prisma · Auth.js · Tailwind v4.

**Demo accounts** (after seeding): `player@kicklink.app` / `organizer@kicklink.app`,
password `password`.

---

## Quickest way to run it: Docker

Requires Docker Desktop (or Docker Engine + Compose). From this `web/` folder:

```bash
docker compose up --build
# in another terminal, load demo data (first run only):
docker compose run --rm app npm run db:seed
```

Open **http://localhost:3000**. That's it — Postgres and the app both run in
containers; migrations apply automatically on boot.

To stop: `docker compose down` (add `-v` to also wipe the database).

> Before deploying for real, change `AUTH_SECRET` in `docker-compose.yml` to a
> long random value: `openssl rand -base64 32`.

---

## Run locally with Node (no Docker)

Requires **Node 22.13+** and a **Postgres 14+** database.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from the example and point `DATABASE_URL` at your Postgres:
   ```bash
   cp .env.example .env
   # edit .env: set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
   ```
3. Set up the schema + demo data, then start:
   ```bash
   npm run db:setup      # apply migrations + seed
   npm run dev           # http://localhost:3000
   ```

For production-style serving instead of dev:
```bash
npm run build && npm run start
```

### Test and verify

Run the fast checks before pushing:

```bash
npm run lint
npm test
npm run build
```

Run browser smoke tests for the public/auth/protected-route flows:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

The E2E suite starts its own local production server on port `3100` by default.
Override with `PLAYWRIGHT_PORT` or point at an existing deployment with
`PLAYWRIGHT_BASE_URL`.

### Environment variables

| Variable                             | Required | Notes                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------- |
| `DATABASE_URL`                       | yes      | Postgres connection string                              |
| `AUTH_SECRET`                        | yes      | `openssl rand -base64 32`                               |
| `AUTH_TRUST_HOST`                    | prod     | set `true` when behind a proxy / on a platform          |
| `ADMIN_EMAILS`                       | bootstrap | comma-separated break-glass admin emails              |
| `ALLOW_ADMIN_EMAIL_BOOTSTRAP`        | no       | set `true` only while assigning the first DB admin      |
| `NEXT_PUBLIC_APP_URL`                | prod     | public URL, used in verification/reset emails           |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no    | enables "Continue with Google"                          |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | alternate Google OAuth env names also supported         |
| `RESEND_API_KEY`                     | no       | sends real verification/reset emails (else logged)      |
| `EMAIL_FROM`                         | no       | from-address for emails                                 |
| `STRIPE_SECRET_KEY`                  | no       | enables real Stripe Connect payments                    |
| `STRIPE_WEBHOOK_SECRET`             | no       | for the `/api/stripe/webhook` endpoint                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no       | Stripe publishable key                                  |
| `PLATFORM_FEE_BPS`                   | no       | platform fee in basis points (e.g. `500` = 5%)          |
| `NEXT_PUBLIC_APP_TIME_ZONE`          | no       | game display timezone, default `UTC`                    |

Without Google / Resend / Stripe keys the app still runs: Google button is
hidden, emails are logged to the server console, and a local test-payment flow
stands in for Stripe.

### Organizer approval

New users cannot create clubs immediately. They apply at `/manage/apply`; platform admins review
applications at `/admin/applications`. Platform admin access should come from the
database-backed `User.platformRole = ADMIN`. For first-admin bootstrap only, set
`ALLOW_ADMIN_EMAIL_BOOTSTRAP=true` with `ADMIN_EMAILS`, sign in, assign the DB
role, then turn `ALLOW_ADMIN_EMAIL_BOOTSTRAP` back off. The seed account
`organizer@kicklink.app` is marked as an approved organizer/admin for demo use.

### Turning on the real integrations

- **Google sign-in:** create an OAuth client at console.cloud.google.com →
  Credentials. Authorized redirect URI: `<APP_URL>/api/auth/callback/google`.
  Set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
- **Email (verification + reset):** get a free key at resend.com, set
  `RESEND_API_KEY` and `EMAIL_FROM`. Set `NEXT_PUBLIC_APP_URL` so links point at
  your domain.
- **Payments (Stripe Connect):** set `STRIPE_SECRET_KEY`. Each organizer then
  clicks **Connect Stripe** on the Manage page to onboard their club's payout
  account; player payments go to that account (minus `PLATFORM_FEE_BPS`).
  Add a webhook in the Stripe dashboard pointing at
  `<APP_URL>/api/stripe/webhook` for events `checkout.session.completed` and
  `account.updated`, and set `STRIPE_WEBHOOK_SECRET`.

---

## Deploy to the cloud — Vercel + Neon (recommended)

The fastest way to a real public URL. ~10 minutes, free tiers.

### Step 1 — Database (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **Pooled** connection string (Neon → Connect → "Pooled connection").
   It looks like `postgresql://USER:PASS@ep-xxx-pooler.../neondb?sslmode=require`.
   Use the *pooled* one — it's built for serverless.
3. Apply the schema + (optional) demo data from your machine:
   ```bash
   cd web
   npm install
   DATABASE_URL="<neon-pooled-url>" npm run db:deploy
   DATABASE_URL="<neon-pooled-url>" npm run db:seed   # optional
   ```

### Step 2 — Deploy (pick one)

**A. Vercel CLI — no GitHub needed (fastest):**
```bash
cd web
npx vercel            # first run links/creates the project
# add env vars (run once each, choose Production):
npx vercel env add DATABASE_URL
npx vercel env add AUTH_SECRET          # paste: openssl rand -base64 32
npx vercel env add AUTH_TRUST_HOST      # value: true
npx vercel --prod     # deploy to your public URL
```

**B. GitHub + Vercel dashboard:**
1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) and set
   **Root Directory = `web`**.
3. Add the same three env vars in Project → Settings → Environment Variables.
4. Deploy. Every push redeploys automatically.

`postinstall` runs `prisma generate` during the build — no extra config needed.
The app runs on Vercel's Node.js runtime (not edge), so the Postgres driver
works as-is.

> Want real payments? Add `STRIPE_SECRET_KEY` and
> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as env vars; otherwise the local test
> payment flow is used.

---

## Self-host anywhere (Docker)

Already covered above — `docker compose up --build` runs the app + Postgres on
any machine or VPS. Point a domain + reverse proxy (Caddy/Nginx) at port 3000
for a public site.

---

## Project layout

```
app/(marketing)   public landing
app/(auth)        login / signup
app/(app)         authenticated player app + /manage organizer dashboard
components/        UI kit + app components
lib/              db, auth/session, queries, server actions, payments, waitlist
prisma/           schema, migrations, seed
e2e/              Playwright browser smoke tests
proxy.ts          auth route gate (Next 16 middleware)
```

## Tech & security notes

- Passwords hashed with bcrypt; JWT sessions via Auth.js.
- Every mutation is a server action that re-checks auth + club membership +
  capacity, inside DB transactions. Waitlist promotion is automatic.
- Payments go through a Stripe-shaped service (`lib/payments.ts`) — set
  `STRIPE_SECRET_KEY` to enable real charges; otherwise a local test flow runs.
- Security headers set in `next.config.ts`.
- Audit log entries include an application-level hash chain for tamper evidence
  on newly created sensitive actions.
