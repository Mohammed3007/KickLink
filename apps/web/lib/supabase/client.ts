'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../database.types';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}
