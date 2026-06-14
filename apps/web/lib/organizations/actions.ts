'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { organizationCreateSchema, organizationJoinSchema } from '@kicklink/shared';
import type { ActionState } from '../auth/actions';
import { requireUser } from '../auth/guards';
import { createUserServerSupabaseClient } from '../supabase/server';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function createOrganizationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await requireUser('/account/organizations/new');
  const parsed = organizationCreateSchema.safeParse({
    name: formValue(formData, 'name'),
    handle: formValue(formData, 'handle'),
    city: formValue(formData, 'city'),
    venueDefault: formValue(formData, 'venueDefault') || undefined,
    blurb: formValue(formData, 'blurb'),
    requiresApproval: formData.get('requiresApproval') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the organization details.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { data: approvedApplication, error: applicationError } = await supabase
    .from('organizer_applications')
    .select('id')
    .eq('user_id', identity.userId)
    .eq('status', 'approved')
    .is('archived_at', null)
    .limit(1);

  if (applicationError || !approvedApplication || approvedApplication.length === 0) {
    return { ok: false, message: 'You need an approved organizer application before creating an organization.' };
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      handle: parsed.data.handle,
      city: parsed.data.city,
      venue_default: parsed.data.venueDefault ?? null,
      blurb: parsed.data.blurb,
      requires_approval: parsed.data.requiresApproval,
      owner_user_id: identity.userId,
      status: 'active',
      created_by: identity.userId,
    })
    .select('id')
    .single();

  if (organizationError || !organization) {
    return { ok: false, message: 'Organization could not be created. Check that the handle is unique.' };
  }

  await supabase.from('organization_members').insert({
    organization_id: organization.id,
    user_id: identity.userId,
    status: 'active',
    created_by: identity.userId,
  });

  await supabase.from('audit_log_entries').insert({
    actor_user_id: identity.userId,
    action: 'organization_created',
    target_type: 'organization',
    target_id: organization.id,
    organization_id: organization.id,
    metadata: { handle: parsed.data.handle },
  });

  revalidatePath('/organizer');
  redirect('/organizer');
}

export async function joinOrganizationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser('/player/organizations');
  const parsed = organizationJoinSchema.safeParse({
    organizationId: formValue(formData, 'organizationId'),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Enter a valid organization ID.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { error } = await supabase.rpc('join_open_organization', {
    p_organization_id: parsed.data.organizationId,
  });

  if (error) {
    return { ok: false, message: 'That organization could not be joined. It may require an invitation.' };
  }

  revalidatePath('/player/organizations');
  redirect('/player/organizations');
}
