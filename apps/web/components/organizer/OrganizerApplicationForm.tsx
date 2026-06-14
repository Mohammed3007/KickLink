'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { organizerApplicationSchema } from '@kicklink/shared';
import type { ActionState } from '../../lib/auth/actions';
import { submitOrganizerApplicationAction } from '../../lib/organizer/application-actions';

type OrganizerApplicationFormInput = z.infer<typeof organizerApplicationSchema>;

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Submitting...' : 'Submit application'}
    </button>
  );
}

export function OrganizerApplicationForm({
  defaults,
}: {
  defaults: {
    displayName: string;
    phone: string;
    city: string;
  };
}) {
  const [state, action] = useActionState(submitOrganizerApplicationAction, initialState);
  const { register } = useForm<OrganizerApplicationFormInput>({
    defaultValues: {
      legalName: defaults.displayName,
      displayName: defaults.displayName,
      phone: defaults.phone,
      city: defaults.city,
      expectedPlayers: 18,
      expectedGames: 4,
      collectsMoney: false,
    },
  });

  return (
    <form action={action} className="form panel-form">
      <label>
        Legal name
        <input required {...register('legalName')} />
      </label>
      <label>
        Public organizer name
        <input required {...register('displayName')} />
      </label>
      <label>
        Phone
        <input placeholder="+14165550199" required {...register('phone')} />
      </label>
      <label>
        Organization name
        <input placeholder="Westside Sunday League" required {...register('orgName')} />
      </label>
      <label>
        City
        <input required {...register('city')} />
      </label>
      <label>
        Description
        <textarea
          className="textarea"
          placeholder="Tell us who plays, where you host, how often games run, and how you manage safety."
          required
          {...register('description')}
        />
      </label>
      <div className="form-row">
        <label>
          Expected players
          <input min={1} required type="number" {...register('expectedPlayers')} />
        </label>
        <label>
          Games per month
          <input min={1} required type="number" {...register('expectedGames')} />
        </label>
      </div>
      <label className="check-row">
        <input type="checkbox" {...register('collectsMoney')} />
        <span>This organization collects game fees.</span>
      </label>
      <label className="check-row">
        <input required type="checkbox" {...register('agreementAccepted')} />
        <span>I understand organizer approval is manual and does not grant instant workspace access.</span>
      </label>
      <SubmitButton />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
