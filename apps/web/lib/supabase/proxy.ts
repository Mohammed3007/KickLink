import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../database.types';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';
import { isInternalPath } from '../auth/redirects';

const protectedPrefixes = ['/player', '/organizer', '/admin', '/account'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));

  if (!hasAuthCookie && isProtected) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    const returnTo = `${pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set('returnTo', isInternalPath(returnTo) ? returnTo : '/player');
    return NextResponse.redirect(signInUrl);
  }

  if (!hasAuthCookie) {
    return response;
  }

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && isProtected) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    const returnTo = `${pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set('returnTo', isInternalPath(returnTo) ? returnTo : '/player');
    return NextResponse.redirect(signInUrl);
  }

  return response;
}
