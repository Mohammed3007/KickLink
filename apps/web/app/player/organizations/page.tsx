import { requireCompletedProfile } from '../../../lib/auth/guards';

export default async function PlayerOrganizationsPage() {
  await requireCompletedProfile('/player/organizations');
  return (
    <section className="card">
      <h2>Your organizations</h2>
      <p className="muted">Live organization membership arrives after the organizer approval milestone.</p>
    </section>
  );
}
