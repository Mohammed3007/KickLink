'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { ActionState } from '../../lib/auth/actions';
import {
  resetPasswordAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from '../../lib/auth/actions';
import type {
  ResetPasswordInput,
  SignInFormInput,
  SignUpFormInput,
  UpdatePasswordInput,
} from '../../lib/validation/auth';

const initialState: ActionState = { ok: false, message: '' };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button full" disabled={pending} type="submit">
      {pending ? 'Working...' : label}
    </button>
  );
}

function ActionMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }
  return <p className={state.ok ? 'form-message success' : 'form-message'}>{state.message}</p>;
}

export function SignInForm({ returnTo }: { returnTo: string }) {
  const [state, action] = useActionState(signInAction, initialState);
  const { register } = useForm<SignInFormInput>();
  return (
    <form action={action} className="form">
      <input name="returnTo" type="hidden" value={returnTo} />
      <label>
        Email
        <input autoComplete="email" required type="email" {...register('email')} />
      </label>
      <label>
        Password
        <input autoComplete="current-password" required type="password" {...register('password')} />
      </label>
      <SubmitButton label="Sign in" />
      <ActionMessage state={state} />
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);
  const { register } = useForm<SignUpFormInput>();
  return (
    <form action={action} className="form">
      <label>
        Display name
        <input autoComplete="name" required {...register('displayName')} />
      </label>
      <label>
        Email
        <input autoComplete="email" required type="email" {...register('email')} />
      </label>
      <label>
        Password
        <input autoComplete="new-password" required type="password" {...register('password')} />
      </label>
      <label>
        Confirm password
        <input autoComplete="new-password" required type="password" {...register('confirmPassword')} />
      </label>
      <label className="check-row">
        <input required type="checkbox" {...register('acceptedTerms')} />
        <span>I agree to use KickLink for legitimate pickup soccer organization only.</span>
      </label>
      <SubmitButton label="Create account" />
      <ActionMessage state={state} />
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  const { register } = useForm<ResetPasswordInput>();
  return (
    <form action={action} className="form">
      <label>
        Email
        <input autoComplete="email" required type="email" {...register('email')} />
      </label>
      <SubmitButton label="Send reset link" />
      <ActionMessage state={state} />
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, initialState);
  const { register } = useForm<UpdatePasswordInput>();
  return (
    <form action={action} className="form">
      <label>
        New password
        <input autoComplete="new-password" required type="password" {...register('password')} />
      </label>
      <label>
        Confirm new password
        <input autoComplete="new-password" required type="password" {...register('confirmPassword')} />
      </label>
      <SubmitButton label="Update password" />
      <ActionMessage state={state} />
    </form>
  );
}
