"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markAllRead } from "@/lib/actions/notifications";

/** Marks notifications read shortly after the alerts page is viewed. */
export function MarkRead({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!hasUnread || done.current) return;
    done.current = true;
    const t = setTimeout(async () => {
      await markAllRead();
      router.refresh();
    }, 1200);
    return () => clearTimeout(t);
  }, [hasUnread, router]);
  return null;
}
