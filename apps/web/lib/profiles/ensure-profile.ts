import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { VerifiedIdentity } from '../auth/identity';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  identity: VerifiedIdentity,
): Promise<Pick<ProfileRow, 'id' | 'display_name' | 'email' | 'city' | 'profile_completed'> | null> {
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id, display_name, email, city, profile_completed')
    .eq('id', identity.userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  if (readError) {
    return null;
  }

  const fallbackName = identity.email?.split('@')[0] ?? 'KickLink player';
  const { data: created } = await supabase
    .from('profiles')
    .insert({
      id: identity.userId,
      email: identity.email ?? '',
      display_name: fallbackName,
    })
    .select('id, display_name, email, city, profile_completed')
    .single();

  return created ?? null;
}
