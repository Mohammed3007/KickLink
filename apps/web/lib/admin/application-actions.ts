'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { organizerApplicationDecisionSchema } from '@kicklink/shared';
import type { ActionState } from '../auth/actions';
import { requirePlatformAdmin } from '../auth/guards';
import { createUserServerSupabaseClient } from '../supabase/server';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function decideOrganizerApplicationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await requirePlatformAdmin();
  const parsed = organizerApplicationDecisionSchema.safeParse({
    applicationId: formValue(formData, 'applicationId'),
    decision: formValue(formData, 'decision'),
    reason: formValue(formData, 'reason'),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the decision details.' };
  }

  const supabase = await createUserServerSupabaseClient();
  const { data: application, error: readError } = await supabase
    .from('organizer_applications')
    .select('id, user_id, status, organization_name')
    .eq('id', parsed.data.applicationId)
    .single();

  if (readError || !application) {
    return { ok: false, message: 'Application could not be loaded.' };
  }

  if (application.status === 'approved' || application.status === 'rejected') {
    return { ok: false, message: 'This application already has a final decision.' };
  }

  const { error: updateError } = await supabase
    .from('organizer_applications')
    .update({
      status: parsed.data.decision,
      decided_by: identity.userId,
      decision_reason: parsed.data.reason,
      admin_note: parsed.data.reason,
    })
    .eq('id', parsed.data.applicationId);

  if (updateError) {
    return { ok: false, message: 'Decision could not be saved.' };
  }

  await supabase.from('audit_log_entries').insert({
    actor_user_id: identity.userId,
    action: `organizer_application_${parsed.data.decision}`,
    target_type: 'organizer_application',
    target_id: parsed.data.applicationId,
    reason: parsed.data.reason,
    metadata: {
      applicant_user_id: application.user_id,
      organization_name: application.organization_name,
    },
  });

  revalidatePath('/admin/applications');
  redirect('/admin/applications');
}
