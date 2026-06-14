import { requireCompletedProfile } from '../../../lib/auth/guards';
import { JoinOrganizationForm } from '../../../components/organizations/JoinOrganizationForm';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';

export default async function PlayerOrganizationsPage() {
  await requireCompletedProfile('/player/organizations');
  const supabase = await createUserServerSupabaseClient();
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('id, status, organization:organizations(id, name, handle, city, blurb)')
    .order('created_at', { ascending: false });

  return (
    <div className="stack">
      <section className="card">
        <h2>Join an organization</h2>
        <p className="muted">For this milestone, join open organizations with their database UUID.</p>
        <JoinOrganizationForm />
      </section>
      <section className="card">
        <h2>Your organizations</h2>
        <div className="stack">
          {(memberships ?? []).map((membership) => (
            <article className="list-item" key={membership.id}>
              <div>
                <h3>{membership.organization?.name}</h3>
                <p className="muted">
                  {membership.organization?.city} · @{membership.organization?.handle} · {membership.status}
                </p>
                <p>{membership.organization?.blurb}</p>
              </div>
            </article>
          ))}
          {memberships?.length === 0 ? <p className="muted">You have not joined an organization yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
