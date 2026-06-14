'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { OrganizationCreateInput } from '@kicklink/shared';
import type { ActionState } from '../../lib/auth/actions';
import { createOrganizationAction } from '../../lib/organizations/actions';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Creating...' : 'Create organization'}
    </button>
  );
}

export function CreateOrganizationForm() {
  const [state, action] = useActionState(createOrganizationAction, initialState);
  const { register } = useForm<OrganizationCreateInput>({
    defaultValues: {
      city: 'Toronto',
      blurb: 'Private pickup soccer games for vetted local players.',
      requiresApproval: false,
    },
  });

  return (
    <form action={action} className="form panel-form">
      <label>
        Name
        <input required {...register('name')} />
      </label>
      <label>
        Handle
        <input placeholder="westside-sundays" required {...register('handle')} />
      </label>
      <label>
        City
        <input required {...register('city')} />
      </label>
      <label>
        Default venue
        <input {...register('venueDefault')} />
      </label>
      <label>
        Description
        <textarea className="textarea" required {...register('blurb')} />
      </label>
      <label className="check-row">
        <input type="checkbox" {...register('requiresApproval')} />
        <span>Require manual approval before players can join</span>
      </label>
      <SubmitButton />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
