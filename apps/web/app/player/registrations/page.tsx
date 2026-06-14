import { requireCompletedProfile } from '../../../lib/auth/guards';

export default async function PlayerRegistrationsPage() {
  await requireCompletedProfile('/player/registrations');
  return (
    <section className="card">
      <h2>Registrations</h2>
      <p className="muted">Registration status will be database-backed in the registration milestone.</p>
    </section>
  );
}
