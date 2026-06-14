import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { requireOrganizerAccess } from '../../lib/auth/guards';

const nav = [
  { href: '/organizer', label: 'Overview' },
  { href: '/organizer/events', label: 'Events' },
  { href: '/organizer/registrations', label: 'Registrations' },
];

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireOrganizerAccess();
  return (
    <WorkspaceShell nav={nav} subtitle="Approved owners and authorized staff only." title="Organizer">
      {children}
    </WorkspaceShell>
  );
}
