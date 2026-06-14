import { redirect } from 'next/navigation';
import { getVerifiedIdentity } from '../lib/auth/identity';

export default async function IndexPage() {
  const identity = await getVerifiedIdentity();
  if (identity) {
    redirect('/player');
  }
  redirect('/sign-in');
}
