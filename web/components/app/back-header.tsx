"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackHeader({
  title,
  fallback = "/home",
  trailing,
}: {
  title?: string;
  fallback?: string;
  trailing?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-canvas/85 px-3 py-3 backdrop-blur-xl">
      <button
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push(fallback);
        }}
        className="flex size-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-2"
        aria-label="Back"
      >
        <ChevronLeft className="size-5.5" />
      </button>
      {title && (
        <h1 className="flex-1 truncate text-center text-[15px] font-semibold text-ink">
          {title}
        </h1>
      )}
      <div className="flex size-9 items-center justify-center">{trailing}</div>
    </div>
  );
}
