# RLS Test Plan

Phase 1 creates the folder and command target for database policy tests.

Phase 2 should add pgTAP tests here and run them against local Supabase with:

```bash
supabase test db
```

Required coverage:

- Player profile isolation
- Organization member isolation
- Organizer isolation between organizations
- Platform-admin permission checks
- Duplicate registration prevention
- Capacity enforcement and final-spot concurrency
- Registration cancellation
- Attendance authorization
- Audit-log creation and immutability
