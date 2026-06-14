import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-surface px-3.5 text-[15px] text-ink ring-1 ring-line",
        "placeholder:text-ink-3 transition-shadow",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
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
        "w-full rounded-xl bg-surface px-3.5 py-3 text-[15px] text-ink ring-1 ring-line",
        "placeholder:text-ink-3 transition-shadow resize-none",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
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
        "h-11 w-full appearance-none rounded-xl bg-surface px-3.5 text-[15px] text-ink ring-1 ring-line",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
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
        className="block text-sm font-semibold text-ink"
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
