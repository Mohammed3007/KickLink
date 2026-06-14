import { requireCompletedProfile } from '../../../lib/auth/guards';

export default async function PlayerAnnouncementsPage() {
  await requireCompletedProfile('/player/announcements');
  return (
    <section className="card">
      <h2>Announcements</h2>
      <p className="muted">Organization announcements will appear here after membership is live.</p>
    </section>
  );
}
