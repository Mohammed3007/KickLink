'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { freeRegistrationSchema } from '@kicklink/shared';
import type { ActionState } from '../auth/actions';
import { requireUser } from '../auth/guards';
import { createUserServerSupabaseClient } from '../supabase/server';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function registerForFreeEventAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser('/player/games');
  const parsed = freeRegistrationSchema.safeParse({
    eventId: formValue(formData, 'eventId'),
    idempotencyKey: formValue(formData, 'idempotencyKey') || randomUUID(),
  });

  if (!parsed.success) {
    return { ok: false, message: 'Registration could not be started.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { data, error } = await supabase.rpc('register_for_free_event', {
    p_event_id: parsed.data.eventId,
    p_idempotency_key: parsed.data.idempotencyKey,
  });

  if (error || !data || data.length === 0) {
    return { ok: false, message: 'Registration could not be completed. The game may be full or closed.' };
  }

  revalidatePath('/player/games');
  revalidatePath('/player/registrations');
  redirect('/player/registrations');
}
