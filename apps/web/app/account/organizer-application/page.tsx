import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { requireUser } from '../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';
import { OrganizerApplicationForm } from '../../../components/organizer/OrganizerApplicationForm';

export default async function OrganizerApplicationPage() {
  const identity = await requireUser('/account/organizer-application');
  const supabase = await createUserServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, phone, city')
    .eq('id', identity.userId)
    .single();
  const { data: existing } = await supabase
    .from('organizer_applications')
    .select('id, status')
    .eq('user_id', identity.userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(1);
  const hasApplication = existing && existing.length > 0;

  return (
    <WorkspaceShell
      nav={[
        { href: '/player', label: 'Player home' },
        { href: '/account/organizer-application', label: 'Organizer application' },
        { href: '/account/organizer-application/status', label: 'Status' },
        { href: '/account/platform-admin-bootstrap', label: 'Admin bootstrap' },
      ]}
      subtitle="Any authenticated player may apply. Approval is required before organizer access."
      title="Organizer application"
    >
      <section className="card narrow">
        <p className="kicker">Manual review</p>
        <h2>Apply to organize games</h2>
        {hasApplication ? (
          <p className="muted">
            You already have an application on file. Check the status page before submitting another.
          </p>
        ) : (
          <>
            <p className="muted">
              Tell us about the organization you want to run. Submitting this does not grant organizer
              workspace access; approval remains a platform-admin action.
            </p>
            <OrganizerApplicationForm
              defaults={{
                displayName: profile?.display_name ?? '',
                phone: profile?.phone ?? '',
                city: profile?.city ?? '',
              }}
            />
          </>
        )}
      </section>
    </WorkspaceShell>
  );
}
