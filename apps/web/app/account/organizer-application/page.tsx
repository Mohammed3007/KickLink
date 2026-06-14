import Link from 'next/link';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { requireUser } from '../../../lib/auth/guards';

export default async function OrganizerApplicationPage() {
  await requireUser('/account/organizer-application');
  return (
    <WorkspaceShell
      nav={[
        { href: '/player', label: 'Player home' },
        { href: '/account/organizer-application', label: 'Organizer application' },
        { href: '/account/organizer-application/status', label: 'Status' },
      ]}
      subtitle="Any authenticated player may apply. Approval is required before organizer access."
      title="Organizer application"
    >
      <section className="card narrow">
        <p className="kicker">Phase 1 foundation</p>
        <h2>Application access is open to authenticated players</h2>
        <p className="muted">
          The submission workflow begins in the organizer approval milestone. This page is deliberately
          outside `/organizer` so applicants do not receive workspace access early.
        </p>
        <Link className="button link-button" href="/account/organizer-application/status">
          View status
        </Link>
      </section>
    </WorkspaceShell>
  );
}
