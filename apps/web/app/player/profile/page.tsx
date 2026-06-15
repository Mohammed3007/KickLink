import { createUserServerSupabaseClient } from '../../../lib/supabase/server';
import { requireUser } from '../../../lib/auth/guards';
import { ProfileForm } from '../../../components/profile/ProfileForm';
import { ensureProfile } from '../../../lib/profiles/ensure-profile';

export default async function PlayerProfilePage() {
  const identity = await requireUser('/player/profile');
  const supabase = await createUserServerSupabaseClient();
  await ensureProfile(supabase, identity);
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, phone, position, skill_level, city')
    .eq('id', identity.userId)
    .maybeSingle();

  return (
    <section className="card narrow">
      <p className="kicker">Required</p>
      <h2>Player profile</h2>
      <p className="muted">Profile existence is automatic after signup. Completion is a separate step.</p>
      <ProfileForm profile={profile} />
    </section>
  );
}
