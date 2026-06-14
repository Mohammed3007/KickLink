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

## Deploy to the cloud (Vercel + managed Postgres)

The easiest hosted path. ~10 minutes, free tiers available.

1. **Database** — create a free Postgres at [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) and copy its connection string.
2. **Push this repo to GitHub**, then import it in
   [Vercel](https://vercel.com/new). Set the **Root Directory** to `web`.
3. **Environment variables** in Vercel → Project → Settings:
   - `DATABASE_URL` = your Neon/Supabase string
   - `AUTH_SECRET` = `openssl rand -base64 32`
   - `AUTH_TRUST_HOST` = `true`
4. **Apply the schema** to the cloud DB once (from your machine, with the cloud
   `DATABASE_URL` in your shell):
   ```bash
   DATABASE_URL="<cloud-url>" npm run db:deploy
   DATABASE_URL="<cloud-url>" npm run db:seed   # optional demo data
   ```
5. **Deploy.** Vercel builds and hosts it; every push redeploys.

`postinstall` runs `prisma generate` automatically on the build.

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
