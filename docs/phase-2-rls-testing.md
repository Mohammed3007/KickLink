# Phase 2 RLS And Permission Testing

The Phase 1 Supabase migration is a schema draft. Do not treat its RLS helper or enabled-RLS tables
as production-secure.

Phase 2 must add automated tests that prove:

- Non-members cannot read private organization data.
- Organization staff permissions are scoped to one organization only.
- Organizer actions are blocked server-side when the actor lacks the required permission.
- Platform-admin actions are attributed to the platform and audit logged.
- Players can only read their own sensitive profile, payment, refund, and reliability details.
- Duplicate active registrations are rejected.
- Capacity-claim RPCs prevent overselling under concurrency.
- Financial, audit, and important administrative history is never hard-deleted in normal workflows.
