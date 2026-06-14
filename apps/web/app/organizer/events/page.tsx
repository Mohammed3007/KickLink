import { CreateFreeEventForm } from '../../../components/events/CreateFreeEventForm';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';

export default async function OrganizerEventsPage() {
  const supabase = await createUserServerSupabaseClient();
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name', { ascending: true });
  const { data: events } = await supabase
    .from('events')
    .select('id, title, status, start_at, capacity, organization:organizations(name)')
    .order('start_at', { ascending: true });

  return (
    <div className="stack">
      <section className="card">
        <h2>Publish a free game</h2>
        {organizations && organizations.length > 0 ? (
          <CreateFreeEventForm organizations={organizations} />
        ) : (
          <p className="muted">Create an organization before publishing games.</p>
        )}
      </section>
      <section className="card">
        <h2>Events</h2>
        <div className="stack">
          {(events ?? []).map((event) => (
            <article className="list-item" key={event.id}>
              <div>
                <h3>{event.title}</h3>
                <p className="muted">
                  {new Date(event.start_at).toLocaleString()} · {event.status} · capacity {event.capacity}
                </p>
              </div>
            </article>
          ))}
          {events?.length === 0 ? <p className="muted">No events yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
