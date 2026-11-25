# KickLink — web app

Pickup-sports club management: private clubs, games, payments, waitlists and
weekly per-game series. Next.js 16 (App Router) · Postgres + Prisma · Auth.js · Tailwind v4.

Recurring club memberships are supported. Spot transfers, upfront series passes,
and recurring billing for game series are not implemented.

## ROS memberships and member benefits

From **Organize → Memberships & leagues**, enable memberships for ROS. The
default prices are **$5 CAD/month** and **$50 CAD/year**. One subscription covers
all leagues and members-only sessions within that organization. Existing clubs
remain unchanged until their organizer enables the program.

- Players subscribe from `/clubs/<handle>/membership`. Stripe handles automatic
  renewals; cancellation at period end retains access through the paid period.
  The billing portal lets subscribers manage their payment methods and invoices.
- Connect the club's Stripe account from Finances before accepting subscriptions.
  Membership fees use Connect destination charges, like game payments.
- Add `invoice.paid`, `invoice.payment_failed`, `customer.subscription.created`,
  `customer.subscription.updated`, and `customer.subscription.deleted` to the
  platform webhook, alongside the existing Checkout events. Enable the Stripe
  Customer Portal in the platform account's Billing settings for payment methods,
  invoices, and cancellations at the end of the billing period. Keep plan
  switching disabled; active monthly/yearly plan changes are not implemented.
- Organizers can create leagues, and active paid members can enroll. League
  sessions require paid membership and enrollment in that league.
- New-game controls offer **Club roster only** (existing invite behavior),
  **Open to members and non-members**, or **Active paid members only**. Set a
  separate member price, including zero, or leave it blank to keep one price.
  Weekly series inherit the same access and price settings.
- Active paid members move ahead of regular players in the waitlist when club
  priority is enabled. Arrival order is preserved within each tier. Expired
  memberships lose priority; existing offers are never displaced. Ineligible
  member-only waitlisters are skipped until eligible again.
- Membership is checked at booking/offer acceptance. A session quote is stored
  when a place is reserved; existing confirmed bookings are not automatically
  cancelled when a subscription ends. Session fees remain separate from the
  membership fee. Open-session bookings and unpaid membership checkouts do not
  grant access to invite-only games or club announcements.
- Invoice-confirmed paid periods control benefits. Returning from Checkout,
  failed renewals, and unsigned/unrelated events do not grant access. Checkout
  attempts and invoice processing support safe retries.

Apply the `20261124120000_club_memberships` migration before running the new
code. The default monthly/yearly prices are configurable; changes affect new
subscriptions, while existing Stripe subscriptions keep their agreed rate.
The test server uses simulated session payments with a disposable database;
membership provider calls are mocked in integration tests. Live subscription
purchase/renewal should also be exercised with Stripe test-mode webhooks before
production rollout. No real subscription is activated by development flags.

**Demo accounts** (after seeding): `player@kicklink.app` / `organizer@kicklink.app`,
password `password`.

---

## Quickest way to run it: Docker

Requires Docker Desktop (or Docker Engine + Compose). From this `web/` folder:

```bash
cp .env.example .env
# edit .env: set AUTH_SECRET (openssl rand -base64 32), POSTGRES_PASSWORD
# and NEXT_PUBLIC_APP_URL
docker compose up --build
```

Open **http://localhost:3000**. Postgres and the app both run in containers;
migrations apply automatically on boot. The app refuses to start with a
missing or placeholder `AUTH_SECRET`.

To stop: `docker compose down` (add `-v` to also wipe the database).

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

Integration tests exercise capacity, waitlist expiry, payment confirmation and
refunds against a real Postgres. Point them at a **disposable**, migrated
database (they create and delete rows):

```bash
TEST_DATABASE_URL="postgresql://..." npx prisma migrate deploy   # with DATABASE_URL set to the same URL
TEST_DATABASE_URL="postgresql://..." npm run test:integration
```

Run browser smoke tests for the public/auth/protected-route flows:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

The E2E suite prepares static/public assets for the standalone build and starts
its own local production server on port `3100` by default.
Override with `PLAYWRIGHT_PORT` or point at an existing deployment with
`PLAYWRIGHT_BASE_URL`.

Set `TEST_DATABASE_URL` to a disposable, migrated Postgres database to also run
signed-in payment-status regressions (delayed confirmation, cancellation and
refund display). The local browser-test server uses that database too. Without
it, those database-backed cases are skipped; public/auth/asset smoke tests run.

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
| `STRIPE_WEBHOOK_SECRET`             | with Stripe | signing secret of the "Your account" webhook endpoint |
| `STRIPE_CONNECT_WEBHOOK_SECRET`     | with Stripe | signing secret of the "Connected accounts" webhook endpoint |
| `PLATFORM_FEE_BPS`                   | no       | platform fee in basis points (e.g. `500` = 5%)          |
| `NEXT_PUBLIC_APP_TIME_ZONE`          | no       | IANA zone games are entered and shown in, default `America/Toronto` |
| `CRON_SECRET`                        | prod     | bearer token for `/api/cron/sweep` (releases lapsed holds, retries refunds) |
| `NEXT_PUBLIC_LEGAL_NAME`             | prod     | operator name shown in the privacy policy and terms     |
| `NEXT_PUBLIC_SUPPORT_EMAIL`          | prod     | contact address for privacy/support requests            |
| `NEXT_PUBLIC_LEGAL_JURISDICTION`     | no       | governing law in the terms, default `Ontario, Canada`   |
| `NEXT_PUBLIC_PRIVACY_OFFICER`        | prod     | person or title responsible for privacy, shown in the privacy policy (Quebec Law 25) |
| `ALLOW_DEV_PAYMENTS`                 | no       | `true` enables the fake test-payment flow in production (demo only) |
| `ALLOW_DEMO_SEED`                    | no       | `true` lets the seed wipe a DB that has non-demo users  |

Without Google / Resend / Stripe keys the app still runs: the Google button is
hidden and emails are logged to the server console. In development a local
test-payment flow stands in for Stripe; in production it is off (paid games
show "payments not set up") unless `ALLOW_DEV_PAYMENTS=true`.

On start, production servers check their configuration and log warnings for
anything missing (see `lib/config-check.ts`).

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
  In Stripe → Developers → Webhooks add **two** endpoints, both pointing at
  `<APP_URL>/api/stripe/webhook`:
  - *Events on your account*: `checkout.session.completed` and
    `checkout.session.expired`. Its signing secret is `STRIPE_WEBHOOK_SECRET`.
  - *Events on connected accounts*: `account.updated`. Its signing secret is
    `STRIPE_CONNECT_WEBHOOK_SECRET` (keeps organizers' payout status current).

  The app won't start with a Stripe key but no `STRIPE_WEBHOOK_SECRET`.
  Checkout is hosted by Stripe, so no publishable key is needed.
- **Scheduled sweep:** set `CRON_SECRET` (`openssl rand -hex 32`). Vercel runs
  `/api/cron/sweep` daily (`vercel.json`); for the 10-minute schedule, set the
  GitHub repo variable `APP_URL` and secret `CRON_SECRET` to enable
  `.github/workflows/sweep.yml`. Lapsed waitlist offers and checkout holds
  are also released whenever someone opens the game.

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
   DATABASE_URL="<neon-pooled-url>" npm run db:seed   # optional, demo DBs only
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
npx vercel env add NEXT_PUBLIC_APP_URL  # value: https://your-domain
npx vercel env add CRON_SECRET          # paste: openssl rand -hex 32
npx vercel --prod     # deploy to your public URL
```

**B. GitHub + Vercel dashboard:**
1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) and set
   **Root Directory = `web`**.
3. Add the same env vars in Project → Settings → Environment Variables
   (scope `DATABASE_URL` to Production, and give Preview its own database).
4. Deploy. Every push redeploys automatically.

`postinstall` runs `prisma generate` during the build. Production builds on
Vercel also run `prisma migrate deploy` before `next build`
(`scripts/migrate-on-deploy.mjs`), so schema changes ship with the code; set
`SKIP_DEPLOY_MIGRATIONS=true` to manage migrations yourself.
The app runs on Vercel's Node.js runtime (not edge), so the Postgres driver
works as-is.

> Want real payments? Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and
> `STRIPE_CONNECT_WEBHOOK_SECRET`. Without them, paid games can't take
> payments in production.

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
- Payments use Stripe Checkout with Connect destination charges
  (`lib/actions/payments.ts`). Spots are held for 36 minutes during checkout;
  cancellations 24h+ before kickoff are refunded through Stripe
  (`lib/refunds.ts`). Payments that arrive after a game fills are refunded
  automatically.
- Club pages, games and rosters are visible to club members only.
- Game times are stored as UTC instants and entered/shown in
  `NEXT_PUBLIC_APP_TIME_ZONE`.
- Security headers set in `next.config.ts`.
- Audit log entries include an application-level hash chain for tamper evidence
  on newly created sensitive actions.
