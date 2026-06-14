import { requireCompletedProfile } from '../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';

export default async function PlayerRegistrationsPage() {
  await requireCompletedProfile('/player/registrations');
  const supabase = await createUserServerSupabaseClient();
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id, registration_status, payment_status, created_at, event:events(title, start_at, organization:organizations(name))')
    .order('created_at', { ascending: false });

  return (
    <section className="card">
      <h2>Registrations</h2>
      <div className="stack">
        {(registrations ?? []).map((registration) => (
          <article className="list-item" key={registration.id}>
            <div>
              <h3>{registration.event?.title}</h3>
              <p className="muted">
                {registration.event?.start_at ? new Date(registration.event.start_at).toLocaleString() : ''} ·{' '}
                {registration.event?.organization?.name}
              </p>
            </div>
            <p className="pill">
              {registration.registration_status} · {registration.payment_status}
            </p>
          </article>
        ))}
        {registrations?.length === 0 ? <p className="muted">No registrations yet.</p> : null}
      </div>
    </section>
  );
}
