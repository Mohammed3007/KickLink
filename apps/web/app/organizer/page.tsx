import Link from 'next/link';
import { createUserServerSupabaseClient } from '../../lib/supabase/server';

export default async function OrganizerOverviewPage() {
  const supabase = await createUserServerSupabaseClient();
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name, handle, city, status, requires_approval')
    .order('created_at', { ascending: false });

  return (
    <section className="card">
      <h2>Organizer workspace</h2>
      <p className="muted">Organizations shown here are filtered by Supabase RLS and server-side access checks.</p>
      <div className="stack">
        {(organizations ?? []).map((organization) => (
          <article className="list-item" key={organization.id}>
            <div>
              <h3>{organization.name}</h3>
              <p className="muted">
                {organization.city} · @{organization.handle} · {organization.status}
              </p>
              <p className="muted">Organization ID for local testing: {organization.id}</p>
            </div>
            <Link className="button" href="/organizer/events">
              Create game
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
