'use client';

import { useMemo } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '../../lib/auth/actions';
import { registerForFreeEventAction } from '../../lib/registrations/actions';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Registering...' : 'Register for free'}
    </button>
  );
}

export function RegisterForFreeEventForm({ eventId }: { eventId: string }) {
  const [state, action] = useActionState(registerForFreeEventAction, initialState);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  return (
    <form action={action} className="form compact-form">
      <input name="eventId" type="hidden" value={eventId} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <SubmitButton />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
