# ADR 0001: Auth And Platform Admin Access

## Status

Accepted

## Context

KickLink needs email/password login, Google OAuth and platform-admin-only workflows.
Admin access must not depend on browser-editable metadata.

## Decision

- Use Auth.js for sessions and providers.
- Store platform role in the database as `User.platformRole`.
- Permit `ADMIN_EMAILS` only when `ALLOW_ADMIN_EMAIL_BOOTSTRAP=true` for first-admin setup.
- Disable email bootstrap after assigning the first database admin.

## Consequences

- Production admin access is database-backed.
- Emergency bootstrap remains possible but explicit and auditable by configuration review.
- Future admin permission changes should create audit entries.
