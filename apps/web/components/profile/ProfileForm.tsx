'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { ActionState } from '../../lib/auth/actions';
import { completeProfileAction } from '../../lib/auth/actions';
import type { ProfileCompletionInput } from '../../lib/validation/auth';

const initialState: ActionState = { ok: false, message: '' };

function SubmitProfileButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Saving...' : 'Save profile'}
    </button>
  );
}

export function ProfileForm({
  profile,
}: {
  profile: {
    display_name: string;
    phone: string | null;
    position: string | null;
    skill_level: string | null;
    city: string | null;
  } | null;
}) {
  const [state, action] = useActionState(completeProfileAction, initialState);
  const { register } = useForm<ProfileCompletionInput>({
    defaultValues: {
      displayName: profile?.display_name ?? '',
      city: profile?.city ?? '',
      phone: profile?.phone ?? undefined,
      position: profile?.position ?? undefined,
      skillLevel: profile?.skill_level ?? undefined,
    },
  });
  return (
    <form action={action} className="form panel-form">
      <label>
        Display name
        <input required {...register('displayName')} />
      </label>
      <label>
        City
        <input required {...register('city')} />
      </label>
      <label>
        Phone
        <input placeholder="+14165550199" {...register('phone')} />
      </label>
      <label>
        Preferred position
        <input {...register('position')} />
      </label>
      <label>
        Skill level
        <input {...register('skillLevel')} />
      </label>
      <SubmitProfileButton />
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </form>
  );
}
