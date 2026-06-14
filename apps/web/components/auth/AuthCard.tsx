import Link from 'next/link';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">KL</span>
          <span>KickLink</span>
        </Link>
        <h1>{title}</h1>
        <p className="sub">{subtitle}</p>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </main>
  );
}
