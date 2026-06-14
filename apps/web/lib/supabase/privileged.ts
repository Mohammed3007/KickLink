import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { getSupabaseUrl } from './env';

export function createPrivilegedSupabaseClient(reason: string) {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(`Privileged Supabase client requested without SUPABASE_SECRET_KEY: ${reason}`);
  }

  return createClient<Database>(getSupabaseUrl(), secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
