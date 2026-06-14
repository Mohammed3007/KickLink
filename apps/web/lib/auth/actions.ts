'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createUserServerSupabaseClient } from '../supabase/server';
import { getSiteUrl } from '../supabase/env';
import { safeReturnPath } from './redirects';
import {
  profileCompletionSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from '../validation/auth';
import { requireUser } from './guards';

export type ActionState = {
  ok: boolean;
  message: string;
};

const genericAuthError = 'We could not complete that request. Check your details and try again.';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function signUpAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formValue(formData, 'email'),
    password: formValue(formData, 'password'),
    confirmPassword: formValue(formData, 'confirmPassword'),
    displayName: formValue(formData, 'displayName'),
    acceptedTerms: formData.get('acceptedTerms') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? genericAuthError };
  }

  const supabase = await createUserServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/player/profile`,
    },
  });

  if (error) {
    return { ok: false, message: genericAuthError };
  }

  return {
    ok: true,
    message: 'Check the local email inbox for the verification link, then sign in.',
  };
}

export async function signInAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formValue(formData, 'email'),
    password: formValue(formData, 'password'),
  });
  const returnTo = safeReturnPath(formValue(formData, 'returnTo'));

  if (!parsed.success) {
    return { ok: false, message: genericAuthError };
  }

  const supabase = await createUserServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: genericAuthError };
  }

  revalidatePath('/', 'layout');
  redirect(returnTo);
}

export async function signInWithGoogleAction(formData: FormData) {
  const returnTo = safeReturnPath(formValue(formData, 'returnTo'));
  const supabase = await createUserServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}&error=oauth_unavailable`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createUserServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({ email: formValue(formData, 'email') });

  if (!parsed.success) {
    return { ok: false, message: genericAuthError };
  }

  const supabase = await createUserServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/update-password`,
  });

  return { ok: true, message: 'If that email can receive resets, a reset link has been sent.' };
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formValue(formData, 'password'),
    confirmPassword: formValue(formData, 'confirmPassword'),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? genericAuthError };
  }

  const supabase = await createUserServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: genericAuthError };
  }

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Password updated. You can continue to KickLink.' };
}

export async function completeProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await requireUser('/player/profile');
  const parsed = profileCompletionSchema.safeParse({
    displayName: formValue(formData, 'displayName'),
    phone: formValue(formData, 'phone') || undefined,
    position: formValue(formData, 'position') || undefined,
    skillLevel: formValue(formData, 'skillLevel') || undefined,
    city: formValue(formData, 'city'),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check your profile.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.displayName,
      phone: parsed.data.phone ?? null,
      position: parsed.data.position ?? null,
      skill_level: parsed.data.skillLevel ?? null,
      city: parsed.data.city,
      profile_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', identity.userId);

  if (error) {
    return { ok: false, message: 'Profile could not be saved. Please try again.' };
  }

  revalidatePath('/', 'layout');
  redirect('/player');
}
