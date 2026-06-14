import { createUserServerSupabaseClient } from '../../../lib/supabase/server';

export default async function OrganizerRegistrationsPage() {
  const supabase = await createUserServerSupabaseClient();
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id, registration_status, payment_status, created_at, profile:profiles!registrations_user_id_fkey(display_name, email), event:events(title, start_at, organization:organizations(name))')
    .order('created_at', { ascending: false });

  return (
    <section className="card">
      <h2>Registrations</h2>
      <div className="stack">
        {(registrations ?? []).map((registration) => (
          <article className="list-item" key={registration.id}>
            <div>
              <h3>{registration.profile?.display_name ?? registration.profile?.email}</h3>
              <p className="muted">
                {registration.event?.title} ·{' '}
                {registration.event?.start_at ? new Date(registration.event.start_at).toLocaleString() : ''}
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
