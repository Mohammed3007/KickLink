import Link from 'next/link';
import { createUserServerSupabaseClient } from '../../lib/supabase/server';
import { requireUser } from '../../lib/auth/guards';
import { ensureProfile } from '../../lib/profiles/ensure-profile';

export default async function PlayerHomePage() {
  const identity = await requireUser('/player');
  const supabase = await createUserServerSupabaseClient();
  const profile = await ensureProfile(supabase, identity);

  if (!profile?.profile_completed) {
    return (
      <section className="card action-panel">
        <h2>Complete your profile</h2>
        <p className="muted">KickLink needs a real player profile before showing private soccer data.</p>
        <Link className="button link-button" href="/player/profile">
          Complete profile
        </Link>
      </section>
    );
  }

  return (
    <div className="grid two">
      <section className="card">
        <p className="kicker">Signed in</p>
        <h2>{profile.display_name}</h2>
        <p className="muted">{profile.city}</p>
      </section>
      <section className="card">
        <p className="kicker">Next step</p>
        <h2>Join an organization</h2>
        <p className="muted">Use an invitation or organization ID once organizers are enabled.</p>
      </section>
    </div>
  );
}
