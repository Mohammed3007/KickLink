import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { SignInForm } from '../../components/auth/AuthForms';
import { safeReturnPath } from '../../lib/auth/redirects';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.returnTo);
  return (
    <AuthCard
      footer={
        <>
          <Link href="/reset-password">Reset password</Link>
          <span> · </span>
          <Link href="/sign-up">Create account</Link>
        </>
      }
      subtitle="Sign in to manage your pickup soccer registrations."
      title="Welcome back"
    >
      <SignInForm returnTo={returnTo} />
    </AuthCard>
  );
}
