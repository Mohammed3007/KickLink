import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-8">
        <Link href="/" className="inline-flex">
          <Logo size={32} />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Brand side */}
      <div className="bg-brand-field relative hidden overflow-hidden lg:block">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <blockquote className="max-w-md text-2xl font-semibold leading-snug tracking-[-0.01em]">
            “We went from a chaotic group chat and chasing e-transfers to a full
            roster, paid up, every single week.”
          </blockquote>
          <p className="mt-4 text-white/75">
            Maria Santos · Westside Sunday League
          </p>
        </div>
      </div>
    </div>
  );
}
