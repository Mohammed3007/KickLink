import { createUserServerSupabaseClient } from '../supabase/server';

export type VerifiedIdentity = {
  userId: string;
  email: string | null;
};

export async function getVerifiedIdentity(): Promise<VerifiedIdentity | null> {
  const supabase = await createUserServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const emailClaim = data.claims.email;
  return {
    userId: data.claims.sub,
    email: typeof emailClaim === 'string' ? emailClaim : null,
  };
}

export async function getCurrentAuthUser() {
  const supabase = await createUserServerSupabaseClient();
  return supabase.auth.getUser();
}
