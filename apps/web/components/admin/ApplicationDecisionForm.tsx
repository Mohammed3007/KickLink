'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '../../lib/auth/actions';
import { decideOrganizerApplicationAction } from '../../lib/admin/application-actions';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function ApplicationDecisionForm({
  applicationId,
  decision,
  label,
}: {
  applicationId: string;
  decision: 'approved' | 'rejected' | 'more_info_requested';
  label: string;
}) {
  const [state, action] = useActionState(decideOrganizerApplicationAction, initialState);

  return (
    <form action={action} className="inline-action-form">
      <input name="applicationId" type="hidden" value={applicationId} />
      <input name="decision" type="hidden" value={decision} />
      <input
        aria-label={`${label} reason`}
        name="reason"
        placeholder="Decision reason"
        required
      />
      <SubmitButton label={label} />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
