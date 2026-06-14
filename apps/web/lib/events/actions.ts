'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { freeEventCreateSchema } from '@kicklink/shared';
import type { ActionState } from '../auth/actions';
import { requireUser } from '../auth/guards';
import { createUserServerSupabaseClient } from '../supabase/server';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function toIsoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export async function createFreeEventAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await requireUser('/organizer/events');
  const parsed = freeEventCreateSchema.safeParse({
    organizationId: formValue(formData, 'organizationId'),
    title: formValue(formData, 'title'),
    format: formValue(formData, 'format'),
    skillLevel: formValue(formData, 'skillLevel'),
    startAt: toIsoDateTime(formValue(formData, 'startAt')),
    arriveAt: toIsoDateTime(formValue(formData, 'arriveAt')),
    durationMin: formValue(formData, 'durationMin'),
    venueName: formValue(formData, 'venueName'),
    venueAddress: formValue(formData, 'venueAddress'),
    capacity: formValue(formData, 'capacity'),
    waitlistCapacity: formValue(formData, 'waitlistCapacity'),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the game details.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { data: allowed, error: permissionError } = await supabase.rpc('has_organization_permission', {
    target_org_id: parsed.data.organizationId,
    required_permission: 'manage_events',
    target_user_id: identity.userId,
  });

  if (permissionError || allowed !== true) {
    return { ok: false, message: 'You do not have permission to create games for that organization.' };
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      organization_id: parsed.data.organizationId,
      title: parsed.data.title,
      status: 'published',
      format: parsed.data.format,
      skill_level: parsed.data.skillLevel,
      start_at: parsed.data.startAt,
      arrive_at: parsed.data.arriveAt,
      duration_min: parsed.data.durationMin,
      venue_time_zone: 'America/Toronto',
      venue: {
        name: parsed.data.venueName,
        address: parsed.data.venueAddress,
      },
      capacity: parsed.data.capacity,
      waitlist_capacity: parsed.data.waitlistCapacity,
      payment_model: 'free',
      price_gross: 0,
      currency: 'CAD',
      public_code: `kl-${randomUUID()}`,
      created_by: identity.userId,
    })
    .select('id')
    .single();

  if (error || !event) {
    return { ok: false, message: 'Game could not be created.' };
  }

  await supabase.from('audit_log_entries').insert({
    actor_user_id: identity.userId,
    action: 'event_created',
    target_type: 'event',
    target_id: event.id,
    organization_id: parsed.data.organizationId,
    metadata: { payment_model: 'free', title: parsed.data.title },
  });

  revalidatePath('/organizer/events');
  redirect('/organizer/events');
}
