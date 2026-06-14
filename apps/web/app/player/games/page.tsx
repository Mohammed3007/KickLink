import { requireCompletedProfile } from '../../../lib/auth/guards';

export default async function PlayerGamesPage() {
  await requireCompletedProfile('/player/games');
  return (
    <section className="card">
      <h2>Eligible games</h2>
      <p className="muted">Games will appear here once organizations and free events are implemented.</p>
    </section>
  );
}
