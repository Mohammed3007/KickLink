import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { ResetPasswordForm } from '../../components/auth/AuthForms';

export default function ResetPasswordPage() {
  return (
    <AuthCard
      footer={<Link href="/sign-in">Back to sign in</Link>}
      subtitle="Enter your email and use the local inbox reset link."
      title="Reset password"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
