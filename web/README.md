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

Requires **Node 20.9+** and a **Postgres 14+** database.

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

### Environment variables

| Variable                             | Required | Notes                                                  |
| ------------------------------------ | -------- | ------------------------------------------------------ |
| `DATABASE_URL`                       | yes      | Postgres connection string                             |
| `AUTH_SECRET`                        | yes      | `openssl rand -base64 32`                              |
| `AUTH_TRUST_HOST`                    | prod     | set `true` when behind a proxy / on a platform         |
| `STRIPE_SECRET_KEY`                  | no       | set to take real payments (else a local test flow runs)|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no       | Stripe publishable key                                 |

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
proxy.ts          auth route gate (Next 16 middleware)
```

## Tech & security notes

- Passwords hashed with bcrypt; JWT sessions via Auth.js.
- Every mutation is a server action that re-checks auth + club membership +
  capacity, inside DB transactions. Waitlist promotion is automatic.
- Payments go through a Stripe-shaped service (`lib/payments.ts`) — set
  `STRIPE_SECRET_KEY` to enable real charges; otherwise a local test flow runs.
- Security headers set in `next.config.ts`.
