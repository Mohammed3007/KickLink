import Link from 'next/link';
import { requireCompletedProfile } from '../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';

export default async function PlayerGamesPage() {
  await requireCompletedProfile('/player/games');
  const supabase = await createUserServerSupabaseClient();
  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_at, venue, capacity, payment_model, price_gross, organization:organizations(name, city)')
    .in('status', ['published', 'almost_full'])
    .order('start_at', { ascending: true });

  return (
    <section className="card">
      <h2>Eligible games</h2>
      <div className="stack">
        {(events ?? []).map((event) => (
          <article className="list-item" key={event.id}>
            <div>
              <h3>{event.title}</h3>
              <p className="muted">
                {new Date(event.start_at).toLocaleString()} · {event.organization?.name} · {event.payment_model}
              </p>
              <p className="muted">Capacity is enforced by Postgres at registration time.</p>
            </div>
            <Link className="button" href={`/player/games/${event.id}`}>
              View
            </Link>
          </article>
        ))}
        {events?.length === 0 ? <p className="muted">No eligible games yet.</p> : null}
      </div>
    </section>
  );
}
