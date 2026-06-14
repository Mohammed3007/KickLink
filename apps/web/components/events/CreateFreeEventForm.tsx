'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { FreeEventCreateInput } from '@kicklink/shared';
import type { ActionState } from '../../lib/auth/actions';
import { createFreeEventAction } from '../../lib/events/actions';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Publishing...' : 'Publish free game'}
    </button>
  );
}

export function CreateFreeEventForm({
  organizations,
}: {
  organizations: Array<{ id: string; name: string }>;
}) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const arrive = new Date(tomorrow.getTime() - 15 * 60 * 1000);
  const toLocalInput = (date: Date) => date.toISOString().slice(0, 16);
  const [state, action] = useActionState(createFreeEventAction, initialState);
  const { register } = useForm<FreeEventCreateInput>({
    defaultValues: {
      organizationId: organizations[0]?.id ?? '',
      title: 'Sunday pickup',
      format: '7v7',
      skillLevel: 'Intermediate',
      startAt: toLocalInput(tomorrow),
      arriveAt: toLocalInput(arrive),
      durationMin: 90,
      venueName: 'Community Field',
      venueAddress: '100 Main Street',
      capacity: 14,
      waitlistCapacity: 6,
    },
  });

  return (
    <form action={action} className="form panel-form">
      <label>
        Organization
        <select required {...register('organizationId')}>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input required {...register('title')} />
      </label>
      <div className="form-row">
        <label>
          Format
          <input required {...register('format')} />
        </label>
        <label>
          Skill level
          <input required {...register('skillLevel')} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Kickoff
          <input required type="datetime-local" {...register('startAt')} />
        </label>
        <label>
          Arrive by
          <input required type="datetime-local" {...register('arriveAt')} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Duration
          <input min={15} required type="number" {...register('durationMin')} />
        </label>
        <label>
          Capacity
          <input min={1} required type="number" {...register('capacity')} />
        </label>
      </div>
      <label>
        Venue
        <input required {...register('venueName')} />
      </label>
      <label>
        Address
        <input required {...register('venueAddress')} />
      </label>
      <label>
        Waitlist capacity
        <input min={0} required type="number" {...register('waitlistCapacity')} />
      </label>
      <SubmitButton />
      {state.message ? <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p> : null}
    </form>
  );
}
