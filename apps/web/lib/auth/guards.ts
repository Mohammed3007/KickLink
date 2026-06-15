import { redirect } from 'next/navigation';
import { createUserServerSupabaseClient } from '../supabase/server';
import { getVerifiedIdentity } from './identity';
import { ensureProfile } from '../profiles/ensure-profile';

export async function requireUser(returnTo = '/player') {
  const identity = await getVerifiedIdentity();
  if (!identity) {
    redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return identity;
}

export async function requireCompletedProfile(returnTo = '/player') {
  const identity = await requireUser(returnTo);
  const supabase = await createUserServerSupabaseClient();
  const data = await ensureProfile(supabase, identity);

  if (!data?.profile_completed) {
    redirect('/player/profile');
  }

  return { identity, profile: data };
}

export async function requireOrganizerAccess() {
  const identity = await requireUser('/organizer');
  const supabase = await createUserServerSupabaseClient();
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  if (!data || data.length === 0) {
    redirect('/account/organizer-application');
  }

  return identity;
}

export async function requirePlatformAdmin() {
  const identity = await requireUser('/admin');
  const supabase = await createUserServerSupabaseClient();
  const { data, error } = await supabase.rpc('is_platform_admin', { target_user_id: identity.userId });

  if (error || data !== true) {
    redirect('/player');
  }

  return identity;
}
