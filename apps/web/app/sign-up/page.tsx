import Link from 'next/link';
import { AuthCard } from '../../components/auth/AuthCard';
import { SignUpForm } from '../../components/auth/AuthForms';

export default function SignUpPage() {
  return (
    <AuthCard
      footer={<Link href="/sign-in">Already have an account?</Link>}
      subtitle="Create an account, then verify your email through Supabase's local inbox."
      title="Create your KickLink account"
    >
      <SignUpForm />
    </AuthCard>
  );
}
