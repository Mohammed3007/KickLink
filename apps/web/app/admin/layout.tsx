import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { requirePlatformAdmin } from '../../lib/auth/guards';

const nav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/applications', label: 'Applications' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin();
  return (
    <WorkspaceShell nav={nav} subtitle="Database-backed platform-admin access only." title="Platform admin">
      {children}
    </WorkspaceShell>
  );
}
