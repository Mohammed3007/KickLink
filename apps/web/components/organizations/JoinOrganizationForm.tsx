'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '../../lib/auth/actions';
import { joinOrganizationAction } from '../../lib/organizations/actions';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? 'Joining...' : 'Join'}
    </button>
  );
}

export function JoinOrganizationForm() {
  const [state, action] = useActionState(joinOrganizationAction, initialState);

  return (
    <form action={action} className="form compact-form">
      <label>
        Organization ID
        <input name="organizationId" placeholder="Paste a UUID from the organizer" required />
      </label>
      <SubmitButton />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
