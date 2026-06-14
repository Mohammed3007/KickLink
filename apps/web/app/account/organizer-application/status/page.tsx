import { WorkspaceShell } from '../../../../components/layout/WorkspaceShell';
import { requireUser } from '../../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../../lib/supabase/server';
import { statusDisplayLabel } from '@kicklink/shared';
import Link from 'next/link';

export default async function OrganizerApplicationStatusPage() {
  const identity = await requireUser('/account/organizer-application/status');
  const supabase = await createUserServerSupabaseClient();
  const { data: applications } = await supabase
    .from('organizer_applications')
    .select('id, organization_name, city, status, created_at, admin_note, decision_reason')
    .eq('user_id', identity.userId)
    .order('created_at', { ascending: false });

  return (
    <WorkspaceShell
      nav={[
        { href: '/player', label: 'Player home' },
        { href: '/account/organizer-application', label: 'Organizer application' },
        { href: '/account/organizations/new', label: 'Create organization' },
        { href: '/account/platform-admin-bootstrap', label: 'Admin bootstrap' },
      ]}
      subtitle="Organizer access is not granted until platform approval."
      title="Application status"
    >
      <section className="card">
        {applications && applications.length > 0 ? (
          <>
            <h2>Submitted applications</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.organization_name}</td>
                      <td>{application.city}</td>
                      <td>
                        <span className="badge blue">{statusDisplayLabel(application.status)}</span>
                      </td>
                      <td>{new Date(application.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {applications[0]?.admin_note || applications[0]?.decision_reason ? (
              <p className="muted status-note">
                {applications[0].admin_note ?? applications[0].decision_reason}
              </p>
            ) : null}
            {applications.some((application) => application.status === 'approved') ? (
              <Link className="button" href="/account/organizations/new">
                Create organization
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <h2>No submitted application yet</h2>
            <p className="muted">Submit an organizer application when you are ready for manual review.</p>
          </>
        )}
      </section>
    </WorkspaceShell>
  );
}
