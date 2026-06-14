import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { requireUser } from '../../../lib/auth/guards';

function bootstrapSql(userId: string) {
  return `insert into public.platform_admins (user_id, status, created_by)
values ('${userId}', 'active', '${userId}')
on conflict (user_id) do update
set status = 'active', suspended_at = null;

insert into public.platform_admin_permissions (user_id, permission, created_by)
values
  ('${userId}', 'review_organizer_applications', '${userId}'),
  ('${userId}', 'manage_platform_admins', '${userId}'),
  ('${userId}', 'manage_organizations', '${userId}'),
  ('${userId}', 'manage_users', '${userId}'),
  ('${userId}', 'review_reports', '${userId}'),
  ('${userId}', 'view_audit_logs', '${userId}')
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
  '${userId}',
  'platform_admin_bootstrap',
  'platform_admin',
  '${userId}',
  'Manual first-admin bootstrap',
  '{"source":"manual_sql","phase":"web_foundation"}'::jsonb
);`;
}

export default async function PlatformAdminBootstrapPage() {
  const identity = await requireUser('/account/platform-admin-bootstrap');

  return (
    <WorkspaceShell
      nav={[
        { href: '/player', label: 'Player home' },
        { href: '/account/organizer-application', label: 'Organizer application' },
        { href: '/account/platform-admin-bootstrap', label: 'Admin bootstrap' },
      ]}
      subtitle="This page does not grant admin access. It only prepares the manual database command."
      title="Platform admin bootstrap"
    >
      <section className="card narrow">
        <p className="kicker">Manual database operation</p>
        <h2>First admin setup</h2>
        <p className="muted">
          For production, a trusted database operator must run this SQL for an existing authenticated
          user. Future platform-admin changes must be performed by an already authorized admin and
          audit logged.
        </p>
        <div className="readonly-field">
          <span>Your user ID</span>
          <code>{identity.userId}</code>
        </div>
        <pre className="sql-block">
          <code>{bootstrapSql(identity.userId)}</code>
        </pre>
      </section>
    </WorkspaceShell>
  );
}
