# KickLink project context

Reviewed on November 10, 2026 against `main` at
`9f443eca2dfd5eba46a9c5f5296078ed4362419a`.
Updated November 24, 2026 with ROS memberships, leagues, pricing, and member-priority waitlists.
Follow-up fixes and features are implemented locally on `codex/fix-review-bugs`.
This is an onboarding snapshot, not a production certification. Recheck the
referenced implementation when changing behavior.

## Product and source of truth

KickLink replaces WhatsApp name lists and separate payment tracking for private
pickup-sports clubs. Players join clubs by invite code, register for games, pay,
and receive time-limited offers when spots open. Approved organizers run clubs,
rosters, attendance, announcements, and payments. Platform admins review organizer
applications and leads, inspect analytics, and read audit history.

The running application is entirely in `web/`. There is no native iOS/Expo app
in this checkout. `docs/design/prototype/` and its product/flow specs capture the
original, substantially broader iOS-first vision; their feature lists and status
models do not establish what the current app implements. The newer
`docs/design/kicklink-glass/` handoff informs the landing/auth visual design.
Current code and migrations establish current behavior. The README and October
readiness audit have been updated for the review fixes below.

## Architecture

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16.4.5 App Router, React 19.2.4, TypeScript |
| UI | Tailwind 4, shared components, Lucide icons, Motion |
| Data | PostgreSQL, Prisma 7.10.1; generated client in `web/lib/generated/prisma` |
| Connections | Neon adapter for URLs containing `neon.tech`; pg adapter otherwise |
| Authentication | Auth.js 5 beta, email/password and optional Google OAuth, JWT sessions |
| Payments | Stripe-hosted Checkout, Connect Express destination charges, CAD |
| Email | Resend; logs email content when provider is absent |
| Hosting | Vercel + managed Postgres, or standalone Next.js + Docker Compose |

Pages generally fetch data on the server. Client components render interactive
forms and call server actions. There is no separate backend service. Public API
routes handle auth, analytics, Stripe webhooks, health, and scheduled maintenance.

Read `web/AGENTS.md` before implementation. It requires consulting the relevant
version-specific guide under `web/node_modules/next/dist/docs/` before coding.

## Screens and code ownership

| Surface | Routes / source |
| --- | --- |
| Marketing | `/`; `components/landing/*`, `components/glass/*`, `app/glass.css` |
| Account access | `/login`, `/signup`, `/verify`, `/forgot`, `/reset`; `auth.ts`, `lib/actions/auth.ts`, `lib/tokens.ts` |
| Player app | `/home`, `/games`, `/games/[id]`, `/games/[id]/participants`, `/games/[id]/join`, `/clubs`, `/clubs/[handle]`, `/alerts`, `/profile` |
| Organizer | `/manage`, `/manage/apply`, `/manage/clubs/new`, `/manage/games`, `/manage/games/new`, `/manage/games/[id]`, `/manage/members`, `/manage/finances`, `/manage/announcements` |
| Platform admin | `/admin/applications`, `/admin/analytics`, `/admin/audit`, `/admin/leads` |
| Legal | `/privacy`, `/terms`; operator details derive from `lib/legal.ts` |
| Shared queries | `lib/queries.ts`; club visibility, game capacity, dashboard/history |
| Registration | `lib/actions/games.ts`, `lib/waitlist.ts` |
| Money | `lib/actions/payments.ts`, `lib/payment-confirm.ts`, `lib/refunds.ts`, `app/api/stripe/webhook/route.ts` |
| Club/admin mutations | `lib/actions/clubs.ts`, `manage.ts`, `organizer-applications.ts`, `leads.ts` |

## Authorization and account lifecycle

- `proxy.ts` is an optimistic route gate. Database-backed checks in pages and
  actions enforce access; the proxy alone is not sufficient authorization.
- `getCurrentUser` compares JWT and database `sessionVersion`. Password resets
  increment it to revoke outstanding sessions.
- Password users must verify their email. Verification links last 24 hours;
  reset links last one hour. Passwords use bcrypt with cost 12.
- Google is optional. The callback requires Google's verified-email flag and
  removes an unverified password before linking an existing account.
- Club membership has `PLAYER` and `ORGANIZER` roles. Platform `ADMIN` is a
  separate user role; admin status alone does not create club membership.
- `organizerApproved` allows club creation. Creating a club grants the creator
  an organizer membership. Applications are reviewed by platform admins.
- `ADMIN_EMAILS` grants bootstrap access only when
  `ALLOW_ADMIN_EMAIL_BOOTSTRAP=true`; production admin access should be DB-backed.
- Club joins use a club prefix plus eight cryptographically random characters.
  Organizers can rotate invite codes. Some seed codes are intentionally simple.

## Registration, capacity, and money

Registration and payment states are separate. Registration states are
`CONFIRMED`, `PROVISIONAL`, `WAITLISTED`, `OFFERED`, `CANCELLED`. Registration
payment states are `PAID`, `UNPAID`, `FREE`, `REFUNDED`. Payment records separately
use `PENDING`, `SUCCEEDED`, `REFUNDED`, `FAILED`.

`CONFIRMED`, `PROVISIONAL`, and `OFFERED` all occupy capacity.

- `FREE`: reserve directly as confirmed/free.
- `LATER`: reserve provisionally/unpaid; pay online or have an organizer mark
  payment received in person. No enforced payment deadline or automatic expiry.
- `PAY`: checkout creates a provisional hold. Stripe sessions expire after
  31 minutes; normal checkout holds last 36. An existing longer offer window
  may be retained when checkout starts.
- Waitlist promotion fills available places in position/creation order.
  Offers last two hours when kickoff is more than 24 hours away, one hour
  inside 24 hours, and 30 minutes inside six hours, capped at kickoff.
- Offers produce in-app notifications and deferred emails. Failed emails are
  retried by the sweep. Leaving the queue compacts positions.
- Most registration mutations and payment confirmation lock the game row
  within a transaction. Offline payment now locks and rechecks the current
  registration and records payment once, including concurrent retries.
- Stripe's completion webhook establishes paid confirmation; the success URL
  alone does not establish payment. Stripe session IDs deduplicate confirmation.
- If a completed payment cannot obtain capacity, it is recorded with
  `refundDue=true`; the webhook and sweep attempt the refund.
- Players receive a card refund when cancelling at least 24 hours before
  kickoff. Organizer removal refunds card payments regardless of that cutoff.
  Refunds reverse transfers and platform fees and use an idempotency key.
  Offline payments must be settled by the organizer.
- Development payments are disabled in production unless explicitly enabled
  for a demo with `ALLOW_DEV_PAYMENTS=true`.

Weekly series create individual game rows up front, up to 26 occurrences.
Each occurrence is paid separately. Time entry/display uses one app-wide zone,
default `America/Toronto`; weekly scheduling preserves wall time across DST.

## Analytics, leads, and maintenance

Analytics use a daily salted IP/user-agent hash without browser-stored IDs or
account associations for new events. Paths retain only allowlisted query keys;
referrers retain their hostname. The client respects DNT/GPC; the endpoint
checks GPC and filters bots. Counts across multiple days sum daily visitors.

The landing contact form is implemented: it validates, uses a honeypot and rate
limit, stores `OrganizerLead`, and optionally emails support. Admins can mark
leads handled. This is separate from a signed-in organizer application.

`GET /api/cron/sweep` requires a timing-safe bearer-secret comparison. It releases
expired holds/offers, sends pending offer emails, retries due refunds, and purges
analytics after 13 months, leads after approximately 24 months, and idle
rate-limit records after 24 hours. Viewing game details also sweeps that game.
Vercel config schedules a daily sweep; GitHub is intended to supply ten-minute
sweeps when `APP_URL` and `CRON_SECRET` are configured.

## Visual design and unfinished functionality

The landing/auth Glass system uses near-black, gold, and pitch-green accents,
Archivo typography, linked-ring branding, glass surfaces, and 3D pitch scenes.
The app also uses Plus Jakarta Sans and Space Grotesk. Desktop scroll animations
use Motion; mobile/touch modes reduce expensive filters and background motion.
Reduced-motion and server-rendered fallback states are explicitly supported.

Visible pricing/testimonial/response-time placeholders are intentional; do not
replace them with invented numbers or endorsements.

The original designs include many features absent from current production code:
native apps, Apple sign-in, guest/team registration, spot transfers, game-series recurring
billing/upfront passes, saved notification preferences, push notifications,
staff permissions, public discovery, disputes/support queues, and broad platform
administration. Calendar/directions/share tiles on the payment-success page are
presentational. Actual weekly per-game series and multi-sport games do exist.
Audit logging currently covers organizer application decisions and club creation,
not every financial or administrative action.

## ROS memberships (November 24, 2026)

ROS requested one automatically renewing membership covering every league and
member-only session: $5 CAD monthly or $50 CAD yearly, cancellable at period end.
These are configurable defaults and opt-in per organization.

- Organizer controls: `/manage/memberships` for prices, enablement, priority,
  subscribers, membership receipts/totals, and league creation. New-game controls
  support `CLUB`, `OPEN`, or `MEMBERS` access, an optional member price, and league
  association. Weekly series inherit all three settings.
- Player controls: `/clubs/[handle]/membership` for plan purchase, payment-status
  refresh, cancellation/resuming renewal, billing portal, receipts, and league
  enrollment. One subscription covers the entire organization, not each league.
- `ClubSubscription` belongs to a club roster record; `MembershipInvoice` stores
  paid invoice receipts. `Membership.clubAccess=false` on an unpaid subscription
  attempt prevents Checkout from silently granting invite-only club privileges.
  Open-session bookings do not create club access.
- Entitlement uses invoice-confirmed `paidThrough`, checked at reservation,
  checkout, and offer acceptance. Cancellation retains paid access to period end;
  failed invoices never extend access. Existing registrations remain accessible
  after expiry. Member-only waitlist entries without current eligibility are
  skipped, and renewal can make them eligible again.
- `Registration.priceCents` freezes a server-computed session quote. Game totals
  use actual successful payment amounts, and pending balances use quoted prices.
- `Registration.waitlistedAt` preserves true arrival order. Promotion dynamically
  sorts eligible active paid members ahead of regular players when enabled,
  maintaining FIFO within tiers. Active offers are never displaced.
- Stripe Billing uses platform Checkout subscriptions with Connect destination
  charges. Persistent checkout attempts/idempotency keys recover ambiguous calls;
  paid-invoice IDs deduplicate renewals. Webhooks re-fetch current provider state,
  validate club/customer/attempt/amount, and do not shorten paid-through dates.
- Provider orchestration: `lib/membership-checkout.ts`, `lib/club-billing.ts`;
  policies: `membership-policy.ts`, `session-terms.ts`, `league-enrollment.ts`.
- New additive migration: `20261124120000_club_memberships`. Live rollout requires
  the platform invoice/subscription webhooks and Customer Portal setup described
  in `web/README.md`, plus enabling ROS in organizer settings. No live keys or
  external configuration were changed. Tests mock membership provider calls;
  Stripe test-mode purchase/renewal remains a rollout check.
- Validation: 66 unit tests, 28 database regressions, and 13 browser journeys;
  lint, TypeScript, build and production dependency audit. Next.js was patched to
  16.4.5, with a scoped Effect 3.22.1 override for Prisma configuration tooling.

## Review fixes and verification (November 10 baseline)

The six findings from the onboarding review are addressed on the local fix branch:

1. `.github/workflows/sweep.yml` now uses a YAML block scalar for its curl
   command. Both workflow files parse successfully. GitHub's previous failed
   run remains historical; no workflow has been pushed or rerun remotely.
2. Both browser-server entry points prepare standalone static/public assets.
   A browser regression checks asset responses, loaded CSS, JavaScript errors,
   and the interactive password toggle so missing assets cannot silently pass.
3. `lib/registration-updates.ts` serializes offline payment with the game lock,
   checks organizer membership, expires stale holds, reloads registration state,
   checks capacity, and treats an already-paid retry as a no-op. Database tests
   cover concurrent retries, cancellation while waiting for the lock, expired
   offers, and unauthorized callers.
4. Free/pay-later offer acceptance returns expected errors from its transaction
   so expiry cleanup and promotion commit. Database regressions verify both
   models and the next player's successful acceptance.
5. Payment-success UI refreshes server data every three seconds while visible,
   for up to 20 automatic checks, with a manual status button. It stops on paid,
   cancelled, or refunded status and shows the appropriate result. Signed-in
   browser regressions simulate each delayed database outcome.
6. README, readiness audit, and landing copy now reflect current offer windows,
   implemented weekly per-game series, and unimplemented transfer/billing features.

Verified after the fixes:

- Lint, TypeScript checks, and production build passed.
- All 63 unit tests passed.
- All 17 PostgreSQL integration tests passed.
- All 8 Chromium browser tests passed, including three signed-in payment cases.
- All 19 existing migrations applied to a fresh disposable local database.
- No schema changes were needed. Live Stripe, Google OAuth, Resend, production
  configuration, and a Docker image build were not exercised.

Node/npm are not on the shell's default PATH. Review used bundled Node 24.22.1
at `/Users/mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
and temporary npm tooling at `/tmp/kicklink-tooling/npm/bin/npm-cli.js`.
Matching Playwright browsers are in `/tmp/kicklink-tooling/browsers`; set
`PLAYWRIGHT_BROWSERS_PATH` to that path when reusing this setup.
A temporary embedded PostgreSQL installation under `/tmp/kicklink-tooling/postgres`
provided the isolated test database. These temporary tools are not new project
requirements; CI continues to use its PostgreSQL 16 service and Node 22.
Set `TEST_DATABASE_URL` to a disposable migrated database to run the integration
and signed-in browser cases. The browser server uses that same database.
No `.env` was created.

The demo seed deletes data and must only be used on a disposable database.

Repository read/push/admin permissions were reported by both the GitHub
connection and CLI; an unchanged `git push --dry-run origin main` succeeded.
No commits, pushes, deployments, or external configuration changes were made.
