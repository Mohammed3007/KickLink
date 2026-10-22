import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[14px] bg-surface px-4 text-[15px] text-ink ring-[1.5px] ring-white/12",
        "placeholder:text-ink-3 transition-shadow",
        "focus:outline-none focus:ring-brand-600 focus:shadow-[0_0_0_4px_rgba(231,185,90,0.16)]",
        "disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[14px] bg-surface px-4 py-3 text-[15px] text-ink ring-[1.5px] ring-white/12",
        "placeholder:text-ink-3 transition-shadow resize-none",
        "focus:outline-none focus:ring-brand-600 focus:shadow-[0_0_0_4px_rgba(231,185,90,0.16)]",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-none rounded-[14px] bg-surface px-4 text-[15px] text-ink ring-[1.5px] ring-white/12",
        "focus:outline-none focus:ring-brand-600 focus:shadow-[0_0_0_4px_rgba(231,185,90,0.16)]",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-semibold text-[#b6b0a4]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-bad">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
