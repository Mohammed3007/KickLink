# KickLink

KickLink is a web-first platform for private pickup soccer organizations. The Expo mobile project
still exists in this monorepo, but it is inactive during the web-first phase.

## Requirements

- Node.js `20.19.0` or compatible `>=20.19.0 <23`
- npm `>=10`
- Docker Desktop for local Supabase

On this Windows machine, PowerShell may pick a broken global `npm.ps1` shim. If `npm run ...`
fails with a missing roaming npm path, use:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run <script>
```

## Clean Install

```bash
npm ci
```

## Local Supabase

Start local Supabase:

```bash
npm run supabase:start
```

Apply migrations and seed from a clean database:

```bash
npm run supabase:reset
```

Generate database types:

```bash
npm run db:types
```

Local services:

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Local email inbox: `http://127.0.0.1:54324`

## Environment

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable key from supabase:start>
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
SUPABASE_SECRET_KEY=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
```

`SUPABASE_SECRET_KEY` is server-only and unused in Phase 1.

## Run Web

```bash
npm run dev:web
```

The web app runs at `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run typecheck
npm run test
npm run build:web
```

## Workspace Structure

```text
kicklink/
  apps/
    mobile/        Inactive Expo project retained for later
    web/           Next.js App Router web app
  packages/
    shared/        statuses, Zod schemas, inferred types, mock payment boundary
  supabase/
    config.toml
    migrations/
    seed.sql
    tests/rls/
  design-reference/
  docs/
```

## Web-First Phase 1 Scope

Implemented:

- Next.js App Router web foundation.
- Supabase local config, executable migration, seed strategy, generated DB types.
- Supabase Auth signup, email-capture verification flow, sign in, sign out, password reset route,
  update-password route, auth callback, and Google OAuth entry point.
- Request-specific Supabase SSR clients.
- `proxy.ts` session refresh and coarse unauthenticated redirects.
- Server-side auth/profile actions.
- Database-triggered profile creation and database-backed profile completion.
- Protected player routes.
- Organizer application route outside the organizer workspace.
- Database-backed organizer application submission and status view.
- Safe platform-admin bootstrap helper that displays manual SQL and does not grant privileges.
- Guarded organizer and platform-admin workspace shells.
- Database-backed platform-admin organizer application review.
- Approved-organizer organization creation.
- Open organization joining by organization UUID.
- Organizer free-game creation and publishing.
- Player eligible-game browsing, game detail, and atomic free registration through Postgres RPC.
- Organizer registration visibility filtered by organization authorization.
- Shared status constants, schemas, permissions, and tests.
- Starter RLS policies and documented Phase 2 RLS test plan.

Not implemented in Phase 1:

- Stripe or real payment processing.
- Paid registration, refunds, disputes, or Stripe Connect onboarding.
- Free-registration concurrency tests.
- Production push notifications.
- Mobile work.

## Local Test Flow

1. Run `npm run supabase:start`, `npm run supabase:reset`, `npm run db:types`, and `npm run dev:web`.
2. Create a user at `/sign-up`, then open the verification link in the local email inbox.
3. Complete the player profile at `/player/profile`.
4. Submit an organizer application at `/account/organizer-application`.
5. Bootstrap a local platform admin by signing in as the admin user and copying the SQL shown at `/account/platform-admin-bootstrap` into Supabase Studio SQL editor.
6. Visit `/admin/applications` and approve the organizer application.
7. As the approved organizer, visit `/account/organizations/new` and create an open organization.
8. Copy the organization ID from `/organizer`, sign in as a second verified user, and join it at `/player/organizations`.
9. As the organizer, create a free game at `/organizer/events`.
10. As the second user, open `/player/games`, view the game, and register.
11. As the organizer, verify the registration at `/organizer/registrations`.

## Security Notes

This phase is secure-by-design groundwork, not a claim that the application is fully secure. See:

- `docs/web-foundation-security.md`
- `docs/platform-admin-bootstrap.md`
- `supabase/tests/rls/README.md`

## Payments

Payments remain mocked only. Free registrations are real database records, but no card data is
collected, no Stripe secret keys are present, and no live payment provider is called. Stripe Connect
should be integrated later behind the shared `PaymentProvider` boundary documented in
`docs/payments.md`.
