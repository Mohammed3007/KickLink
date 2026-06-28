"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type EventType = "PAGE_VIEW" | "USER_EVENT";
type Metadata = Record<string, string | number | boolean | null>;

const analyticsDisabled = process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "true";

declare global {
  interface Window {
    kicklinkTrack?: (name: string, metadata?: Metadata) => void;
  }
}

function idFromStorage(key: string) {
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function sendAnalytics(type: EventType, name: string, metadata: Metadata = {}) {
  if (analyticsDisabled) return;

  const path = `${window.location.pathname}${window.location.search}`;
  const payload = JSON.stringify({
    type,
    name,
    path,
    referrer: document.referrer || "",
    title: document.title || "",
    visitorId: idFromStorage("kicklink_visitor_id"),
    sessionId: idFromStorage("kicklink_session_id"),
    metadata,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics/track", blob)) return;
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (analyticsDisabled) return;
    sendAnalytics("PAGE_VIEW", "page_view");
  }, [pathname]);

  useEffect(() => {
    if (analyticsDisabled) return;

    window.kicklinkTrack = (name, metadata) => sendAnalytics("USER_EVENT", name, metadata);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const element = target.closest<HTMLElement>("[data-analytics-event]");
      const name = element?.dataset.analyticsEvent;
      if (!element || !name) return;

      sendAnalytics("USER_EVENT", name, {
        label: element.dataset.analyticsLabel ?? element.textContent?.trim().slice(0, 80) ?? "",
        href: element instanceof HTMLAnchorElement ? element.href : "",
      });
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      delete window.kicklinkTrack;
    };
  }, []);

  return null;
}
