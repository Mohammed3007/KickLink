# Platform Admin Bootstrap

Platform-admin access is never granted through public UI, client-editable metadata, or self-promotion.

## Local development

1. Start local Supabase.
2. Sign up through the web app.
3. Verify the user through the local Inbucket email link.
4. Copy the authenticated user's UUID from Supabase Studio.
5. Run this SQL against the local database:

```sql
insert into public.platform_admins (user_id, status, created_by)
values ('USER_UUID_HERE', 'active', 'USER_UUID_HERE')
on conflict (user_id) do update
set status = 'active', suspended_at = null;

insert into public.platform_admin_permissions (user_id, permission, created_by)
values
  ('USER_UUID_HERE', 'review_organizer_applications', 'USER_UUID_HERE'),
  ('USER_UUID_HERE', 'manage_platform_admins', 'USER_UUID_HERE'),
  ('USER_UUID_HERE', 'manage_organizations', 'USER_UUID_HERE'),
  ('USER_UUID_HERE', 'manage_users', 'USER_UUID_HERE'),
  ('USER_UUID_HERE', 'review_reports', 'USER_UUID_HERE'),
  ('USER_UUID_HERE', 'view_audit_logs', 'USER_UUID_HERE')
on conflict (user_id, permission) do nothing;

insert into public.audit_log_entries (
  actor_user_id,
  action,
  target_type,
  target_id,
  reason,
  metadata
)
values (
  'USER_UUID_HERE',
  'platform_admin_bootstrap',
  'platform_admin',
  'USER_UUID_HERE',
  'Local development bootstrap',
  '{"environment":"local"}'::jsonb
);
```

## Production

The first production platform admin must be assigned manually to an existing authenticated user by a trusted database operator. Future platform-admin changes must require an existing admin with `manage_platform_admins` and must create audit records.
