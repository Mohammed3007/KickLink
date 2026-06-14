import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { UpdatePasswordForm } from '../../components/auth/AuthForms';

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      footer={<Link href="/player">Continue to KickLink</Link>}
      subtitle="Choose a new password for this account."
      title="Update password"
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
