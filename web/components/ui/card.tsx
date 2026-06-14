import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface ring-1 ring-line shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** A card that's also a link, with a subtle lift on hover. */
export function LinkCard({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-2xl bg-surface ring-1 ring-line shadow-card",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop hover:ring-brand-200",
        className
      )}
    >
      {children}
    </Link>
  );
}
