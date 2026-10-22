import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { rise } from "@/components/auth/rise";

export function AuthPill({ children, delay = 0.05 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      {...rise(delay)}
      className="animate-rise mb-[22px] inline-flex items-center gap-2 rounded-full border border-[rgba(231,185,90,0.22)] bg-white/[0.04] py-1.5 pl-2 pr-[13px] text-[12.5px] font-semibold text-[#d9c9a4]"
    >
      <span className="size-[7px] rounded-full bg-brand-600 shadow-[0_0_0_3px_rgba(231,185,90,0.18)]" />
      {children}
    </div>
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
  return (
    <>
      <h1
        {...rise(delay)}
        className="animate-rise mb-3 text-[40px] font-bold leading-[1.04] tracking-[-0.025em] text-[#f7f5f0]"
      >
        {title}
      </h1>
      {subtitle && (
        <p
          {...rise(delay + 0.06)}
          className="animate-rise mb-[30px] max-w-[380px] text-base leading-[1.55] text-[#928d82]"
        >
          {subtitle}
        </p>
      )}
    </>
  );
}

export function OrDivider({ delay = 0.32 }: { delay?: number }) {
  return (
    <div {...rise(delay)} className="animate-rise my-6 flex items-center gap-3.5">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-[11.5px] font-bold tracking-[0.14em] text-[#6e695e]">OR</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthField({
  label,
  hint,
  id,
  ...input
}: { label: string; hint?: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3.5">
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-[#b6b0a4]">
        {label}
      </label>
      <input
        id={id}
        {...input}
        className="h-[54px] w-full rounded-[14px] border-[1.5px] border-white/12 bg-[#141418] px-4 text-[15.5px] text-[#f2efe8] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#6e695e] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(231,185,90,0.16)]"
      />
      {hint && <p className="mt-1.5 text-xs text-[#7e796e]">{hint}</p>}
    </div>
  );
}

const GOLD_BUTTON = cn(
  "gold-shine bg-gold relative flex h-[54px] w-full items-center justify-center gap-[9px] overflow-hidden rounded-[14px] text-[15.5px] font-bold text-on-brand",
  "shadow-[0_10px_28px_rgba(231,185,90,0.32)] transition-[transform,box-shadow] duration-200",
  "hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(231,185,90,0.48)]"
);

/** The gold button, as a link. */
export function GoldButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={GOLD_BUTTON}>
      <span className="relative z-[1]">{children}</span>
    </Link>
  );
}

/** Gold primary action with the moving shine and an inline spinner. */
export function GoldButton({
  children,
  pending,
  pendingLabel,
  className,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  pending?: boolean;
  pendingLabel?: ReactNode;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(GOLD_BUTTON, "disabled:cursor-wait", className)}
    >
      {pending && (
        <span className="relative z-[1] size-[17px] animate-spin rounded-full border-[2.4px] border-[rgba(26,19,4,0.35)] border-t-on-brand [animation-duration:0.7s]" />
      )}
      <span className="relative z-[1]">{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-[14px] border border-bad/30 bg-bad-bg px-3.5 py-3 text-sm font-medium text-bad"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function AuthFooter({
  children,
  delay = 0.5,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <p {...rise(delay)} className="animate-rise mt-6 text-center text-sm text-[#7e796e]">
      {children}
    </p>
  );
}

export function GoldLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-bold text-brand-600 no-underline hover:text-brand-800">
      {children}
    </Link>
  );
}

/** Centered result card (email sent, password updated, link expired...). */
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
    <div
      role="status"
      className="animate-pop rounded-[18px] border-[1.5px] border-[rgba(231,185,90,0.2)] bg-[#141418] px-[26px] py-[30px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
    >
      <span
        className={cn(
          "mx-auto mb-[18px] flex size-[58px] items-center justify-center rounded-full",
          tone === "gold"
            ? "bg-[linear-gradient(135deg,#f4d78b,#c9952f)] text-on-brand"
            : "bg-bad-bg text-bad ring-1 ring-bad/30"
        )}
      >
        {icon}
      </span>
      <h2 className="mb-2 text-[22px] font-bold text-[#f7f5f0]">{title}</h2>
      <div className="text-[14.5px] leading-[1.55] text-[#928d82]">{children}</div>
    </div>
  );
}
