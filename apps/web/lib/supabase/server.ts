import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../database.types';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';

export async function createUserServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. The proxy refresh path handles writes.
        }
      },
    },
  });
}
