# KickLink Operations Runbook

## MVP Targets

- RTO: 4 hours for a production outage.
- RPO: 24 hours until point-in-time recovery is enabled; 15 minutes after PITR is enabled.
- Availability target: best-effort MVP, moving toward 99.5% after monitoring and backups are verified.

## Required Production Configuration

The server checks its configuration at start (`lib/config-check.ts`). It refuses
to start on fatal problems and logs `{"msg":"config"}` warnings for the rest;
check the first log lines of every new deployment.

- Vercel production deployment with HTTPS.
- Managed Postgres with automated daily backups. Give Preview deployments their
  own database: production builds apply migrations automatically.
- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_APP_URL`.
- `CRON_SECRET`, plus the GitHub repo variable `APP_URL` and secret
  `CRON_SECRET` for the 10-minute sweep workflow.
- Google OAuth redirect URIs for every production/preview domain used.
- Resend API key and verified sender domain for email verification/reset.
- Stripe Connect keys and two webhook endpoints, both at `/api/stripe/webhook`:
  "Your account" (`checkout.session.completed`, `checkout.session.expired`)
  with secret `STRIPE_WEBHOOK_SECRET`, and "Connected accounts"
  (`account.updated`) with secret `STRIPE_CONNECT_WEBHOOK_SECRET`.
- `NEXT_PUBLIC_LEGAL_NAME` and `NEXT_PUBLIC_SUPPORT_EMAIL` for the legal pages.
- `ALLOW_ADMIN_EMAIL_BOOTSTRAP=false` after the first DB admin has been assigned.
- `ALLOW_DEV_PAYMENTS` and `ALLOW_DEMO_SEED` unset.

## Deploys And Migrations

- Vercel production builds run `prisma migrate deploy` before `next build`
  (`scripts/migrate-on-deploy.mjs`). A failed migration fails the build and
  the previous deployment keeps serving.
- Migrations must stay backward compatible with the previous release for the
  few minutes both run side by side: add columns with defaults, backfill, and
  only drop things in a later release.
- `20261022144624_game_times_to_eastern` shifts existing
  game times from UTC wall-clock to America/Toronto. If production uses a
  different `NEXT_PUBLIC_APP_TIME_ZONE`, edit that migration before its first
  deploy.

## First Admin Bootstrap

1. Create/sign in as the intended admin user.
2. Temporarily set:
   - `ADMIN_EMAILS=<admin email>`
   - `ALLOW_ADMIN_EMAIL_BOOTSTRAP=true`
3. Redeploy, sign in, verify admin access.
4. Set `User.platformRole = ADMIN` directly in the production database for that user.
5. Set `ALLOW_ADMIN_EMAIL_BOOTSTRAP=false` and redeploy.

## Scheduled Sweep

`GET /api/cron/sweep` with `Authorization: Bearer $CRON_SECRET`:

- cancels waitlist offers past their 15-minute window and checkout holds past
  36 minutes, then offers the freed spots to the waitlist;
- retries refunds for payments flagged `refundDue` (paid after the game filled).

It runs every 10 minutes from GitHub Actions (`.github/workflows/sweep.yml`)
and daily from Vercel Cron. Game pages also release lapsed holds when viewed.
To run it by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/sweep
```

## Payments And Refunds

- Player cancels 24h+ before kickoff: refunded automatically through Stripe,
  reversing the club transfer and platform fee. Inside 24h: no refund.
- Organizer removes a player: always refunded.
- In-person payments ("Mark paid") are never refunded by the app; the organizer
  settles them directly.
- Payment arrived after the game filled: payment row has `refundDue = true`;
  the webhook refunds it and the sweep retries until it clears. To find stuck
  ones: `SELECT * FROM "Payment" WHERE "refundDue" AND status = 'SUCCEEDED';`
- A refund that fails during cancellation leaves the registration unchanged
  and asks the player to retry; check logs for `Refund failed`.

## Sessions

Password resets bump `User.sessionVersion`, signing out every device. To force
sign-out for a compromised account:

```sql
UPDATE "User" SET "sessionVersion" = "sessionVersion" + 1 WHERE email = '<email>';
```

## Backup And Restore

- Enable daily automated backups on the managed database.
- Enable point-in-time recovery before public launch if available.
- Run a restore drill at least quarterly:
  1. Restore production backup to a temporary database.
  2. Point a staging deploy at the restored DB.
  3. Verify login, games list, registrations and organizer dashboard.
  4. Destroy temporary DB after verification.

## Monitoring And Alerts

Configure external monitoring for:

- `/api/health` every 1-5 minutes (expects `200 {"ok":true}`; `503` means the
  database is unreachable).
- Vercel deployment failures.
- Server errors: each one is logged as a JSON line with
  `"msg":"unhandled_server_error"`. Forward logs with a Vercel log drain
  (or add Sentry) and alert on that message.
- `"msg":"email_send_failed"` and `Refund failed` log lines.
- Stripe webhook failures (Stripe dashboard → Webhooks shows failed deliveries).
- The `Scheduled sweep` GitHub workflow failing.

## Incident Response

1. Confirm impact and affected surfaces.
2. Check Vercel deployment status and runtime logs.
3. Check database health and connection limits.
4. Check Stripe/Resend provider status when payments/email are impacted.
5. Roll back the Vercel deployment if a recent release caused the issue.
6. If database corruption is suspected, stop writes and restore from backup.
7. Write a short post-incident note with cause, timeline and prevention.

## Data Retention

- Auth/users/profiles: retain while account is active.
- Payment/audit records: retain for legal/accounting needs; do not hard-delete in normal workflows.
- Analytics events: retain 13 months, then delete:
  `DELETE FROM "AnalyticsEvent" WHERE "createdAt" < now() - interval '13 months';`
- Handle access, correction and deletion requests manually (privacy policy
  promises a response within 30 days) until self-service tooling exists.
