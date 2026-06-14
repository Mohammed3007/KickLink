import { redirect } from 'next/navigation';
import { CreateOrganizationForm } from '../../../../components/organizations/CreateOrganizationForm';
import { requireUser } from '../../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../../lib/supabase/server';

export default async function NewOrganizationPage() {
  const identity = await requireUser('/account/organizations/new');
  const supabase = await createUserServerSupabaseClient();
  const { data: applications } = await supabase
    .from('organizer_applications')
    .select('id')
    .eq('user_id', identity.userId)
    .eq('status', 'approved')
    .is('archived_at', null)
    .limit(1);

  if (!applications || applications.length === 0) {
    redirect('/account/organizer-application/status');
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <p className="eyebrow">Approved organizer</p>
        <h1>Create organization</h1>
        <p className="muted">
          This creates a real Supabase organization row and makes you the organization owner.
        </p>
        <CreateOrganizationForm />
      </section>
    </main>
  );
}
