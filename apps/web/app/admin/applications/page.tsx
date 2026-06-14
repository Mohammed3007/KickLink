import { ApplicationDecisionForm } from '../../../components/admin/ApplicationDecisionForm';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';
import { statusDisplayLabel } from '@kicklink/shared';

export default async function AdminApplicationsPage() {
  const supabase = await createUserServerSupabaseClient();
  const { data: applications } = await supabase
    .from('organizer_applications')
    .select('id, display_name, organization_name, city, description, expected_players, expected_games, collects_money, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <section className="card">
      <h2>Organizer applications</h2>
      <div className="stack">
        {(applications ?? []).map((application) => (
          <article className="list-item" key={application.id}>
            <div>
              <p className="eyebrow">{statusDisplayLabel(application.status)}</p>
              <h3>{application.organization_name}</h3>
              <p className="muted">
                {application.display_name} · {application.city} · {application.expected_players} players ·{' '}
                {application.expected_games} games/month
              </p>
              <p>{application.description}</p>
              <p className="muted">
                Collects money: {application.collects_money ? 'yes' : 'no'}
              </p>
            </div>
            {application.status === 'approved' || application.status === 'rejected' ? null : (
              <div className="decision-grid">
                <ApplicationDecisionForm applicationId={application.id} decision="approved" label="Approve" />
                <ApplicationDecisionForm applicationId={application.id} decision="more_info_requested" label="More info" />
                <ApplicationDecisionForm applicationId={application.id} decision="rejected" label="Reject" />
              </div>
            )}
          </article>
        ))}
        {applications?.length === 0 ? <p className="muted">No organizer applications yet.</p> : null}
      </div>
    </section>
  );
}
