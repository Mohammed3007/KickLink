'use server';

import { redirect } from 'next/navigation';
import { organizerApplicationSchema } from '@kicklink/shared';
import type { ActionState } from '../auth/actions';
import { requireUser } from '../auth/guards';
import { createUserServerSupabaseClient } from '../supabase/server';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function intValue(formData: FormData, key: string) {
  const value = Number.parseInt(formValue(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

export async function submitOrganizerApplicationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await requireUser('/account/organizer-application');
  const supabase = await createUserServerSupabaseClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', identity.userId)
    .single();

  if (profileError || !profile) {
    return { ok: false, message: 'Your profile could not be loaded. Please sign in again.' };
  }

  const parsed = organizerApplicationSchema.safeParse({
    legalName: formValue(formData, 'legalName'),
    displayName: formValue(formData, 'displayName'),
    email: profile.email,
    phone: formValue(formData, 'phone'),
    orgName: formValue(formData, 'orgName'),
    city: formValue(formData, 'city'),
    description: formValue(formData, 'description'),
    expectedPlayers: intValue(formData, 'expectedPlayers'),
    expectedGames: intValue(formData, 'expectedGames'),
    collectsMoney: formData.get('collectsMoney') === 'on',
    agreementAccepted: formData.get('agreementAccepted') === 'on',
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Please check the application details.',
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from('organizer_applications')
    .select('id, status')
    .eq('user_id', identity.userId)
    .is('archived_at', null)
    .in('status', ['new', 'under_review', 'verification_pending', 'more_info_requested', 'approved'])
    .limit(1);

  if (existingError) {
    return { ok: false, message: 'Application status could not be checked. Please try again.' };
  }

  if (existing && existing.length > 0) {
    redirect('/account/organizer-application/status');
  }

  const { error } = await supabase.from('organizer_applications').insert({
    user_id: identity.userId,
    legal_name: parsed.data.legalName,
    display_name: parsed.data.displayName,
    email: profile.email,
    phone: parsed.data.phone,
    organization_name: parsed.data.orgName,
    city: parsed.data.city,
    description: parsed.data.description,
    expected_players: parsed.data.expectedPlayers,
    expected_games: parsed.data.expectedGames,
    collects_money: parsed.data.collectsMoney,
    created_by: identity.userId,
  });

  if (error) {
    return { ok: false, message: 'Application could not be submitted. Please try again.' };
  }

  redirect('/account/organizer-application/status');
}
