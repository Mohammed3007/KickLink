-- KickLink Phase 1 executable schema.
-- This establishes the web-first foundation, starter RLS, and documented helper design.
-- Phase 2 must add automated RLS isolation, authorization, and registration-concurrency tests.

create extension if not exists pgcrypto with schema extensions;

create type public.event_status as enum (
  'draft',
  'published',
  'almost_full',
  'full',
  'registration_closed',
  'cancelled',
  'completed'
);

create type public.registration_status as enum (
  'pending',
  'provisional',
  'confirmed',
  'waitlisted',
  'spot_offered',
  'transfer_pending',
  'cancelled',
  'attended',
  'no_show'
);

create type public.payment_status as enum (
  'not_required',
  'unpaid',
  'payment_due',
  'processing',
  'paid',
  'failed',
  'partially_refunded',
  'refunded',
  'disputed'
);

create type public.refund_status as enum (
  'not_requested',
  'requested',
  'under_review',
  'approved',
  'rejected',
  'processing',
  'completed',
  'failed'
);

create type public.transfer_status as enum (
  'transfer_pending',
  'approval_pending',
  'replacement_pending',
  'complete',
  'failed',
  'expired',
  'cancelled'
);

create type public.waitlist_status as enum (
  'waitlisted',
  'spot_offered',
  'offer_accepted',
  'offer_declined',
  'offer_expired',
  'removed'
);

create type public.spot_offer_status as enum (
  'offered',
  'accepted',
  'declined',
  'expired',
  'cancelled'
);

create type public.membership_status as enum ('pending', 'active', 'removed', 'suspended');
create type public.organization_status as enum ('draft', 'active', 'suspended', 'archived');
create type public.recurrence_edit_scope as enum ('one_occurrence', 'this_and_following', 'entire_series');
create type public.organizer_application_status as enum (
  'new',
  'under_review',
  'verification_pending',
  'more_info_requested',
  'approved',
  'rejected',
  'suspended'
);
create type public.report_status as enum ('new', 'under_review', 'resolved', 'dismissed');
create type public.attendance_state as enum ('present', 'late', 'no_show', 'excused');
create type public.platform_admin_status as enum ('active', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  legal_name text,
  phone text,
  photo_url text,
  position text,
  skill_level text,
  city text,
  notification_preferences jsonb not null default '{"email":true,"push":false}'::jsonb,
  profile_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (display_name = '' or char_length(display_name) between 2 and 40)
);
comment on table public.profiles is
  'Profiles are created by trigger after auth.users. profile_completed is distinct from existence.';

create table public.organizer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  legal_name text not null,
  display_name text not null,
  email text not null,
  phone text not null,
  organization_name text not null,
  city text not null,
  description text not null,
  expected_players integer not null check (expected_players >= 1),
  expected_games integer not null check (expected_games >= 1),
  collects_money boolean not null,
  verification_status text not null default 'provider_stub',
  status public.organizer_application_status not null default 'new',
  admin_note text,
  decided_by uuid references public.profiles(id),
  decision_reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text not null unique,
  city text not null,
  venue_default text,
  logo_url text,
  cover_url text,
  blurb text not null default '',
  is_private boolean not null default true,
  requires_approval boolean not null default true,
  whatsapp_url text,
  owner_user_id uuid not null references public.profiles(id),
  status public.organization_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references public.profiles(id),
  status public.membership_status not null default 'pending',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, user_id)
);

create table public.organization_staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references public.profiles(id),
  title text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (organization_id, user_id)
);

create table public.organization_staff_permissions (
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references public.profiles(id),
  permission text not null check (
    permission in (
      'manage_events',
      'manage_members',
      'manage_registrations',
      'manage_waitlist',
      'manage_attendance',
      'send_announcements',
      'view_finances',
      'manage_payments',
      'issue_refunds',
      'manage_staff',
      'manage_organization'
    )
  ),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (organization_id, user_id, permission)
);
comment on table public.organization_staff_permissions is
  'Organization-specific permissions. A permission in one organization grants no access in another.';

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  invited_email text,
  role text not null check (role in ('member', 'staff')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  max_uses integer check (max_uses is null or max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0),
  revoked_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (max_uses is null or use_count <= max_uses)
);
comment on table public.organization_invitations is
  'Store only hashes of high-entropy invitation tokens. Tokens are organization-bound, expiring, revocable, and validated server-side. Raw tokens must never be logged.';

create table public.recurring_event_series (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  title text not null,
  recurrence_rule text not null,
  venue_time_zone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
comment on table public.recurring_event_series is
  'Future recurring-game parent. Edits must distinguish one occurrence, this and following occurrences, and entire series.';

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  recurring_series_id uuid references public.recurring_event_series(id),
  series_occurrence_at timestamptz,
  title text not null,
  status public.event_status not null default 'draft',
  format text not null,
  skill_level text not null,
  start_at timestamptz not null,
  arrive_at timestamptz not null,
  duration_min integer not null check (duration_min between 15 and 240),
  venue_time_zone text not null,
  venue jsonb not null,
  capacity integer not null check (capacity >= 1),
  waitlist_capacity integer not null default 0 check (waitlist_capacity >= 0),
  payment_model text not null default 'free' check (payment_model in ('free', 'pay_now', 'pay_later')),
  price_gross numeric(10,2) not null default 0 check (price_gross >= 0),
  currency text not null default 'CAD',
  allow_guests boolean not null default false,
  max_guests integer not null default 0 check (max_guests >= 0),
  public_code text not null unique,
  refund_policy jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (arrive_at <= start_at)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  user_id uuid not null references public.profiles(id),
  registration_status public.registration_status not null default 'pending',
  payment_status public.payment_status not null default 'not_required',
  payment_deadline_at timestamptz,
  amount_paid_gross numeric(10,2),
  currency text not null default 'CAD',
  idempotency_key text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index registrations_one_active_per_user_event
  on public.registrations (event_id, user_id)
  where registration_status in (
    'pending',
    'provisional',
    'confirmed',
    'waitlisted',
    'spot_offered',
    'transfer_pending'
  )
  and archived_at is null;

create table public.registration_guests (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id),
  display_name text not null,
  attendance_state public.attendance_state,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
comment on table public.registration_guests is
  'Guests belong to a primary registration through this table and are never fake authenticated users.';

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  user_id uuid not null references public.profiles(id),
  position integer not null check (position >= 1),
  status public.waitlist_status not null default 'waitlisted',
  idempotency_key text unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.spot_offers (
  id uuid primary key default gen_random_uuid(),
  waitlist_entry_id uuid not null references public.waitlist_entries(id),
  event_id uuid not null references public.events(id),
  user_id uuid not null references public.profiles(id),
  status public.spot_offer_status not null default 'offered',
  expires_at timestamptz not null,
  idempotency_key text unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.transfer_requests (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id),
  event_id uuid not null references public.events(id),
  from_user_id uuid not null references public.profiles(id),
  to_user_id uuid references public.profiles(id),
  status public.transfer_status not null default 'transfer_pending',
  deadline_at timestamptz not null,
  idempotency_key text unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id),
  user_id uuid not null references public.profiles(id),
  event_id uuid not null references public.events(id),
  organization_id uuid not null references public.organizations(id),
  gross numeric(10,2) not null,
  fee numeric(10,2) not null default 0,
  net numeric(10,2) not null,
  currency text not null default 'CAD',
  method text not null default 'offline' check (method in ('card', 'offline', 'future_provider')),
  status public.payment_status not null,
  provider_reference text,
  receipt_url text,
  idempotency_key text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.payments is
  'Financial records are retained and status-updated; do not hard-delete during normal workflows.';

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  gross numeric(10,2) not null,
  fee numeric(10,2) not null default 0,
  net numeric(10,2) not null,
  currency text not null default 'CAD',
  reason text,
  status public.refund_status not null default 'requested',
  requested_by uuid references public.profiles(id),
  decided_by uuid references public.profiles(id),
  decision_reason text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  registration_id uuid references public.registrations(id),
  user_id uuid not null references public.profiles(id),
  state public.attendance_state not null,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz not null default now(),
  correction_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (event_id, user_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  event_id uuid references public.events(id),
  author_id uuid not null references public.profiles(id),
  title text not null,
  body text not null,
  delivery jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.notification_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  kind text not null,
  title text not null,
  body text not null,
  unread boolean not null default true,
  deep_link text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz
);

create table public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  platform text not null check (platform in ('ios', 'android', 'web')),
  token text not null,
  environment text not null default 'development',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (platform, token)
);

create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id),
  reported_user_id uuid references public.profiles(id),
  organization_id uuid references public.organizations(id),
  event_id uuid references public.events(id),
  reason text not null,
  details text,
  status public.report_status not null default 'new',
  reviewed_by uuid references public.profiles(id),
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.audit_log_entries (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  organization_id uuid references public.organizations(id),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default now()
);
comment on table public.audit_log_entries is
  'Append-only administrative history. Normal users and organization staff cannot update or delete audit rows.';

create table public.platform_admins (
  user_id uuid primary key references public.profiles(id),
  status public.platform_admin_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  suspended_at timestamptz
);
comment on table public.platform_admins is
  'Platform-admin access is database controlled. No client-editable metadata can grant this role.';

create table public.platform_admin_permissions (
  user_id uuid not null references public.platform_admins(user_id),
  permission text not null check (
    permission in (
      'review_organizer_applications',
      'manage_platform_admins',
      'manage_organizations',
      'manage_users',
      'review_reports',
      'view_audit_logs'
    )
  ),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, permission)
);

create table public.idempotency_keys (
  key text primary key,
  user_id uuid not null references public.profiles(id),
  operation text not null,
  result jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger organizer_applications_updated_at before update on public.organizer_applications
for each row execute function public.set_updated_at();

create trigger organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_updated_at before update on public.organization_members
for each row execute function public.set_updated_at();

create trigger organization_staff_updated_at before update on public.organization_staff
for each row execute function public.set_updated_at();

create trigger organization_invitations_updated_at before update on public.organization_invitations
for each row execute function public.set_updated_at();

create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();

create trigger registrations_updated_at before update on public.registrations
for each row execute function public.set_updated_at();

create trigger waitlist_entries_updated_at before update on public.waitlist_entries
for each row execute function public.set_updated_at();

create trigger platform_admins_updated_at before update on public.platform_admins
for each row execute function public.set_updated_at();

create or replace function public.is_platform_admin(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = target_user_id
      and pa.status = 'active'
      and pa.suspended_at is null
  );
$$;

create or replace function public.has_platform_permission(required_permission text, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_platform_admin(target_user_id)
    and exists (
      select 1
      from public.platform_admin_permissions pap
      where pap.user_id = target_user_id
        and pap.permission = required_permission
        and pap.revoked_at is null
    );
$$;

create or replace function public.is_organization_owner(target_org_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organizations o
    where o.id = target_org_id
      and o.owner_user_id = target_user_id
      and o.archived_at is null
  );
$$;

create or replace function public.is_organization_member(target_org_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org_id
      and om.user_id = target_user_id
      and om.status = 'active'
      and om.archived_at is null
  );
$$;

create or replace function public.has_organization_permission(
  target_org_id uuid,
  required_permission text,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_organization_owner(target_org_id, target_user_id)
    or exists (
      select 1
      from public.organization_staff os
      join public.organization_staff_permissions osp
        on osp.organization_id = os.organization_id
       and osp.user_id = os.user_id
      where os.organization_id = target_org_id
        and os.user_id = target_user_id
        and os.revoked_at is null
        and osp.permission = required_permission
        and osp.revoked_at is null
    );
$$;

comment on function public.is_platform_admin(uuid) is
  'SECURITY DEFINER helper with fixed empty search_path to avoid recursive RLS checks. Phase 2 tests unauthorized access.';
comment on function public.has_platform_permission(text, uuid) is
  'Checks platform-admin permission from database rows, never client metadata.';
comment on function public.is_organization_owner(uuid, uuid) is
  'Organization owner check scoped by organization id and user id.';
comment on function public.is_organization_member(uuid, uuid) is
  'Organization member check scoped by organization id and user id.';
comment on function public.has_organization_permission(uuid, text, uuid) is
  'Organization-scoped staff permission helper. A user permission in one org does not apply to another org.';

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.is_platform_admin(uuid) from public, anon;
revoke all on function public.has_platform_permission(text, uuid) from public, anon;
revoke all on function public.is_organization_owner(uuid, uuid) from public, anon;
revoke all on function public.is_organization_member(uuid, uuid) from public, anon;
revoke all on function public.has_organization_permission(uuid, text, uuid) from public, anon;

grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.has_platform_permission(text, uuid) to authenticated;
grant execute on function public.is_organization_owner(uuid, uuid) to authenticated;
grant execute on function public.is_organization_member(uuid, uuid) to authenticated;
grant execute on function public.has_organization_permission(uuid, text, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizer_applications enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_staff enable row level security;
alter table public.organization_staff_permissions enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.recurring_event_series enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_guests enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.spot_offers enable row level security;
alter table public.transfer_requests enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.attendance_records enable row level security;
alter table public.announcements enable row level security;
alter table public.notification_records enable row level security;
alter table public.device_push_tokens enable row level security;
alter table public.user_reports enable row level security;
alter table public.audit_log_entries enable row level security;
alter table public.platform_admins enable row level security;
alter table public.platform_admin_permissions enable row level security;
alter table public.idempotency_keys enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or public.is_platform_admin());

create policy "profiles_update_own_safe_fields"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "organizer_applications_insert_own"
on public.organizer_applications for insert
to authenticated
with check ((select auth.uid()) = user_id and (select auth.uid()) = created_by);

create policy "organizer_applications_select_own_or_admin"
on public.organizer_applications for select
to authenticated
using (user_id = (select auth.uid()) or public.has_platform_permission('review_organizer_applications'));

create policy "organizer_applications_update_own_unsubmitted"
on public.organizer_applications for update
to authenticated
using (user_id = (select auth.uid()) and status in ('new', 'more_info_requested'))
with check (user_id = (select auth.uid()));

create policy "organizations_select_member_staff_or_admin"
on public.organizations for select
to authenticated
using (
  public.is_organization_member(id)
  or public.has_organization_permission(id, 'manage_organization')
  or public.is_platform_admin()
);

create policy "organization_members_select_self_staff_or_admin"
on public.organization_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.has_organization_permission(organization_id, 'manage_members')
  or public.is_platform_admin()
);

create policy "events_select_eligible"
on public.events for select
to authenticated
using (
  status in ('published', 'almost_full', 'full', 'registration_closed', 'completed')
  and public.is_organization_member(organization_id)
  or public.has_organization_permission(organization_id, 'manage_events')
  or public.is_platform_admin()
);

create policy "registrations_select_own_or_org_staff"
on public.registrations for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.events e
    where e.id = registrations.event_id
      and public.has_organization_permission(e.organization_id, 'manage_registrations')
  )
  or public.is_platform_admin()
);

create policy "payments_select_own_finance_or_admin"
on public.payments for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.has_organization_permission(organization_id, 'view_finances')
  or public.is_platform_admin()
);

create policy "audit_log_select_authorized"
on public.audit_log_entries for select
to authenticated
using (
  public.is_platform_admin()
  or (
    organization_id is not null
    and public.has_organization_permission(organization_id, 'manage_organization')
  )
);

create policy "platform_admins_select_self_or_admin"
on public.platform_admins for select
to authenticated
using (user_id = (select auth.uid()) or public.has_platform_permission('manage_platform_admins'));

create policy "platform_admin_permissions_select_self_or_admin"
on public.platform_admin_permissions for select
to authenticated
using (user_id = (select auth.uid()) or public.has_platform_permission('manage_platform_admins'));

create policy "notification_records_select_own"
on public.notification_records for select
to authenticated
using (user_id = (select auth.uid()));

create policy "device_push_tokens_select_own"
on public.device_push_tokens for select
to authenticated
using (user_id = (select auth.uid()));

create policy "device_push_tokens_insert_own"
on public.device_push_tokens for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "device_push_tokens_update_own"
on public.device_push_tokens for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Deferred to Phase 2 automated pgTAP/transactional tests:
-- - Cross-organization organizer isolation for every organization table.
-- - Full platform-admin permission matrix.
-- - Atomic register/cancel RPC, final capacity race test, and idempotency replay behavior.
-- - Write policies for privileged tables through narrow server/RPC paths only.
