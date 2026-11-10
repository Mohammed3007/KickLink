import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";
import { MagneticButton, MagneticLink } from "@/components/glass/magnetic";
import { SplitLetters } from "@/components/glass/split-letters";
import { PasswordInput } from "@/components/auth/password-input";
import { rise } from "@/components/auth/rise";

// Building blocks for the auth pages, styled by the .kl-auth rules in
// app/glass.css. AuthShell provides the glass card they sit in.

export function AuthPill({ children, delay = 0.05 }: { children: ReactNode; delay?: number }) {
  const r = rise(delay);
  return (
    <span className={`chip glass auth-pill ${r.className}`} style={r.style}>
      <span className="dot" />
      {children}
    </span>
  );
}

export function AuthHeading({
  title,
  subtitle,
  delay = 0.12,
}: {
  title: string;
  subtitle?: ReactNode;
  delay?: number;
}) {
  const r = rise(delay + 0.3);
  return (
    <>
      <h1 aria-label={title}>
        <SplitLetters lines={[title.split(" ").map((text) => ({ text }))]} />
      </h1>
      {subtitle && (
        <p className={`lead ${r.className}`} style={r.style}>
          {subtitle}
        </p>
      )}
    </>
  );
}

export function OrDivider({ delay = 0.32 }: { delay?: number }) {
  const r = rise(delay);
  return (
    <div className={`or ${r.className}`} style={r.style}>
      or
    </div>
  );
}

export function AuthField({
  label,
  hint,
  id,
  type,
  ...input
}: { label: string; hint?: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {type === "password" ? (
        <PasswordInput id={id} {...input} />
      ) : (
        <div className="inp">
          <input id={id} type={type} {...input} />
        </div>
      )}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** The gold button, as a link. */
export function GoldButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <MagneticLink href={href} className="btn btn-p btn-full">
      {children}
      {ARROW}
    </MagneticLink>
  );
}

/** Full-width magnetic gold action with an inline spinner while pending. */
export function GoldButton({
  children,
  pending,
  pendingLabel,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  pending?: boolean;
  pendingLabel?: ReactNode;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <MagneticButton
      type={type}
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
      className="btn btn-p btn-full"
    >
      {pending ? (
        <>
          <span className="spin" aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        <>
          {children}
          {ARROW}
        </>
      )}
    </MagneticButton>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="auth-alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16h.01" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

export function AuthFooter({ children, delay = 0.5 }: { children: ReactNode; delay?: number }) {
  const r = rise(delay);
  return (
    <p className={`foot-note ${r.className}`} style={r.style}>
      {children}
    </p>
  );
}

export function GoldLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href}>{children}</Link>;
}

/** Result panel (email sent, password updated, link expired...). */
export function AuthStatusCard({
  icon,
  title,
  tone = "gold",
  children,
}: {
  icon: ReactNode;
  title: string;
  tone?: "gold" | "bad";
  children?: ReactNode;
}) {
  return (
    <div role="status" className="status">
      <span className={tone === "bad" ? "check bad" : "check"}>{icon}</span>
      <h2>{title}</h2>
      <div className="body">{children}</div>
    </div>
  );
}
