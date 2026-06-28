# KickLink Operations Runbook

## MVP Targets

- RTO: 4 hours for a production outage.
- RPO: 24 hours until point-in-time recovery is enabled; 15 minutes after PITR is enabled.
- Availability target: best-effort MVP, moving toward 99.5% after monitoring and backups are verified.

## Required Production Configuration

- Vercel production deployment with HTTPS.
- Managed Postgres with automated daily backups.
- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_APP_URL`.
- Google OAuth redirect URIs for every production/preview domain used.
- Resend API key and verified sender domain for email verification/reset.
- Stripe Connect keys and webhook secret for payments.
- `ALLOW_ADMIN_EMAIL_BOOTSTRAP=false` after the first DB admin has been assigned.

## First Admin Bootstrap

1. Create/sign in as the intended admin user.
2. Temporarily set:
   - `ADMIN_EMAILS=<admin email>`
   - `ALLOW_ADMIN_EMAIL_BOOTSTRAP=true`
3. Redeploy, sign in, verify admin access.
4. Set `User.platformRole = ADMIN` directly in the production database for that user.
5. Set `ALLOW_ADMIN_EMAIL_BOOTSTRAP=false` and redeploy.

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

- `/api/health` every 1-5 minutes.
- Vercel deployment failures.
- Database connection errors.
- Stripe webhook failures.
- Email send failures.

Recommended providers: Sentry for app errors and Checkly/UptimeRobot/Vercel checks for uptime.

## Incident Response

1. Confirm impact and affected surfaces.
2. Check Vercel deployment status and runtime logs.
3. Check database health and connection limits.
4. Check Stripe/Resend provider status when payments/email are impacted.
5. Roll back the Vercel deployment if a recent release caused the issue.
6. If database corruption is suspected, stop writes and restore from backup.
7. Write a short post-incident note with cause, timeline and prevention.

## Data Retention

MVP recommendation:

- Auth/users/profiles: retain while account is active.
- Payment/audit records: retain for legal/accounting needs; do not hard-delete in normal workflows.
- Analytics events: retain 13 months, then aggregate or delete.
- Support deletion/export requests manually until self-service tooling exists.
