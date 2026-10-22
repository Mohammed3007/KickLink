# KickLink Production-Readiness Audit

Date: 2026-10-22 (supersedes the 2026-06-28 audit)

Status definitions:

- Done: implemented and verified (tests and/or a browser run against Postgres).
- Partial: useful foundation exists but gaps remain.
- Missing: not present yet.
- Owner action: can't be done in code; needs an account, setting or decision.

## Summary

The October review found launch blockers the June audit had marked complete:
vulnerable dependencies, a free-payment path, refunds that were recorded but
never sent, guessable invite codes, members-only data visible to any user,
game times stored 4-5 hours off, and spots held indefinitely. These are now
fixed and covered by tests. What remains is mostly owner configuration
(accounts, secrets, backups, monitoring, legal review) plus some deeper test
coverage.

## Launch Blockers

| Item | Status | Notes |
| --- | --- | --- |
| Dependency vulnerabilities | Done | Next 16.4, Auth.js beta.32, Prisma 7.10; `npm audit --omit=dev` is clean and gated in CI (high+). Dev-only eslint advisories remain. |
| Payments without Stripe | Done | Test-payment flow is off in production unless `ALLOW_DEV_PAYMENTS=true`. |
| Refunds | Done | Real Stripe refunds (transfer and fee reversed) 24h+ before kickoff and on organizer removal; cancel button states the outcome. |
| Overfilled games | Done | Payment confirmation and "Mark paid" check capacity under a row lock; late payments are refunded (`refundDue`, retried by the sweep). Integration test covers concurrent payments. |
| Abandoned holds / offers | Done | Checkout sessions expire at 31 min, holds at 36; offers at 15. Released on page view, by the 10-minute GitHub sweep, and by a daily Vercel cron. |
| Club privacy | Done | Games, rosters and announcements are members-only; outsiders see a join card. |
| Invite codes | Done | 8 random characters (CSPRNG), joins rate limited, organizers can rotate codes. Codes created before this change are weak; rotate them (Manage → Members). |
| Account takeover via Google | Done | Requires Google-verified email; drops the password on unverified accounts before linking. |
| Session revocation | Done | Password reset signs out all devices (`sessionVersion`). |
| Auth abuse | Done | Per-IP and per-(email, IP) form limits, per-account ceiling on password checks, per-mailbox email cap. |
| Game time zone | Done | Entered and shown in `NEXT_PUBLIC_APP_TIME_ZONE` (default America/Toronto); DST-safe weekly series; existing rows migrated. |
| Health endpoint leak | Done | Returns only ok/unreachable. |
| Schema migrations on deploy | Done | Vercel production builds run `prisma migrate deploy` first. |
| Config mistakes | Done | Startup check refuses placeholder secrets or Stripe without a webhook secret, warns on the rest. |

## Owner Actions Before Launch

| Item | Status | Action |
| --- | --- | --- |
| Production secrets | Owner action | Set everything in the runbook's "Required Production Configuration", including `CRON_SECRET`. |
| Sweep schedule | Owner action | GitHub repo variable `APP_URL` + secret `CRON_SECRET`. |
| Stripe webhook | Owner action | Add `checkout.session.expired` to the endpoint's events. |
| First admin | Owner action | Assign `platformRole=ADMIN` in the DB; keep bootstrap off. |
| Legal pages | Owner action | Set `NEXT_PUBLIC_LEGAL_NAME` / `NEXT_PUBLIC_SUPPORT_EMAIL`; have the drafted privacy policy and terms reviewed. |
| Backups | Owner action | Enable daily backups + PITR on the database; run one restore drill. |
| Monitoring | Owner action | Uptime check on `/api/health`; log drain or Sentry alerting on `unhandled_server_error`. |
| GitHub hygiene | Owner action | Branch protection requiring Web CI, Dependabot alerts. |
| Rotate old invite codes | Owner action | Existing clubs: Manage → Members → Generate new code. |

## Quality

| Item | Status | Notes |
| --- | --- | --- |
| CI | Done | Lint, unit, Postgres integration tests, prod audit, build, Playwright smoke. |
| Unit tests | Done | Validators, rate limits, IP handling, time zones, refund policy, config checks, audit hash. |
| Integration tests | Partial | Payments, waitlist expiry, refunds against Postgres. Server actions (auth/permission paths) still untested at this level. |
| E2E tests | Partial | Public pages, auth forms, redirects, legal pages. No logged-in join/pay/organizer flows yet. |
| Docker image | Partial | Compose updated; image build not verified in the October review (no Docker daemon available). |
| Load testing | Missing | Add light k6 runs for login, games list and checkout. |
| Accessibility | Partial | No automated axe checks yet. |

## Known Limitations

- Single app-wide time zone. Clubs in other regions need a per-club zone.
- Upfront series passes, recurring billing and spot transfers exist in the
  schema but are not implemented; the UI no longer offers them.
- Pay-later (`LATER`) games have no payment deadline; organizers mark payments
  or remove players.
- Rate limiting and analytics write to Postgres on each request; fine at MVP
  scale, revisit (Redis/edge) with traffic.
- Tenant isolation relies on application checks, not database row-level security.
- No self-service data export/deletion; handled by email per the privacy policy.
- Audit hash chain is application-level and not externally anchored.
- The repo root still holds the original Vite design prototype (`src/`,
  `index.html`, `project/`, `chats/`); it is not part of the app.
