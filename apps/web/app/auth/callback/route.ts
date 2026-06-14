import { NextResponse, type NextRequest } from 'next/server';
import { createUserServerSupabaseClient } from '../../../lib/supabase/server';
import { safeReturnPath } from '../../../lib/auth/redirects';
import { getSiteUrl } from '../../../lib/supabase/env';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeReturnPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createUserServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, getSiteUrl()));
}
