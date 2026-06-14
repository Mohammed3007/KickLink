import Link from 'next/link';
import { signOutAction } from '../../lib/auth/actions';

export function WorkspaceShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  nav: Array<{ href: string; label: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <Link className="brand" href="/player">
          <span className="brand-mark">KL</span>
          <span>KickLink</span>
        </Link>
        <nav className="nav">
          {nav.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="signout-form">
          <button className="ghost-button" type="submit">
            Sign out
          </button>
        </form>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="sub">{subtitle}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
