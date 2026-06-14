import { WorkspaceShell } from '../../../../components/layout/WorkspaceShell';
import { requireUser } from '../../../../lib/auth/guards';

export default async function OrganizerApplicationStatusPage() {
  await requireUser('/account/organizer-application/status');
  return (
    <WorkspaceShell
      nav={[
        { href: '/player', label: 'Player home' },
        { href: '/account/organizer-application', label: 'Organizer application' },
      ]}
      subtitle="Organizer access is not granted until platform approval."
      title="Application status"
    >
      <section className="card">
        <h2>No submitted application yet</h2>
        <p className="muted">Live application submission and admin review are deferred to the next milestone.</p>
      </section>
    </WorkspaceShell>
  );
}
