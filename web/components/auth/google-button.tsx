"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/lib/actions/oauth";
import { rise } from "@/components/auth/rise";

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-analytics-event="auth.google_click"
      data-analytics-label={label}
      className="flex h-[54px] w-full items-center justify-center gap-[11px] rounded-[14px] border-[1.5px] border-white/10 bg-[#16161a] text-[15.5px] font-semibold text-[#f2efe8] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(231,185,90,0.45)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.4)] disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z" />
        </svg>
      )}
      {label}
    </button>
  );
}

export function GoogleButton({
  label = "Continue with Google",
  delay = 0.26,
}: {
  label?: string;
  delay?: number;
}) {
  return (
    <form action={signInWithGoogle} {...rise(delay)}>
      <Inner label={label} />
    </form>
  );
}

export { OrDivider } from "@/components/auth/auth-ui";
