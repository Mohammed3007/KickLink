# Web Foundation Security Notes

Phase 1 is secure-by-design groundwork, not a claim of full production security.

## Supabase clients

- Browser client: uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- User-context server client: uses the same publishable key plus request cookies so RLS remains active.
- Privileged client: isolated in `apps/web/lib/supabase/privileged.ts`, server-only, unused in Phase 1.

Do not use `getSession()` as authorization proof. The proxy and guards use verified identity through `getClaims()` and use `getUser()` only when an up-to-date Auth server lookup is required.

## Proxy

`apps/web/proxy.ts` refreshes the Supabase session, redirects clearly unauthenticated protected requests, and preserves only safe internal return paths. It is not the final authorization layer.

## Profile lifecycle

Profiles are created by the `public.handle_new_auth_user()` database trigger after `auth.users` insert. Profile existence and profile completion are separate:

- `profiles` row exists after signup.
- `profile_completed = false` until the user completes required player fields.
- Protected player pages that require a full profile redirect to `/player/profile`.
- `/player/profile` does not redirect on incomplete profile, avoiding loops.

## Invitation security

Organization invitations must use random high-entropy tokens. Only token hashes are stored. Tokens are bound to an organization, expire, may be revoked, may have a maximum use count, and are validated server-side. Raw invitation tokens must not appear in logs, audit metadata, URLs beyond the one-time user-facing link, or analytics.

Organization IDs and human-readable join codes are identifiers, not secrets.

## Deferred RLS work

Starter RLS exists for Phase 1. Phase 2 must add automated pgTAP and integration tests for player isolation, organizer cross-organization isolation, platform-admin access, privileged writes, registration capacity, and audit-log immutability.
