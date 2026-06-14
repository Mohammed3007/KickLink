import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { requireUser } from '../../lib/auth/guards';

const nav = [
  { href: '/player', label: 'Home' },
  { href: '/player/organizations', label: 'Organizations' },
  { href: '/player/games', label: 'Games' },
  { href: '/player/registrations', label: 'Registrations' },
  { href: '/player/announcements', label: 'Announcements' },
  { href: '/player/profile', label: 'Profile' },
];

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/player');
  return (
    <WorkspaceShell nav={nav} subtitle="Player workspace" title="KickLink">
      {children}
    </WorkspaceShell>
  );
}
