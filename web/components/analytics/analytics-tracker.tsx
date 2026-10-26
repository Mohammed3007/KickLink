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
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

// Visitor IDs used to live in local storage; analytics no longer store
// anything in the browser, so clear what older versions left behind.
function clearLegacyIds() {
  try {
    window.localStorage.removeItem("kicklink_visitor_id");
    window.localStorage.removeItem("kicklink_session_id");
  } catch {
    // Storage blocked: nothing to clear.
  }
}

function trackingAllowed() {
  return !analyticsDisabled && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== "1";
}

function sendAnalytics(type: EventType, name: string, metadata: Metadata = {}) {
  if (!trackingAllowed()) return;

  // The server keeps only an allowlist of query parameters; send no hash.
  const path = `${window.location.pathname}${window.location.search}`;
  const payload = JSON.stringify({
    type,
    name,
    path,
    referrer: document.referrer || "",
    title: document.title || "",
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
    clearLegacyIds();
  }, []);

  useEffect(() => {
    sendAnalytics("PAGE_VIEW", "page_view");
  }, [pathname]);

  useEffect(() => {
    if (!trackingAllowed()) return;

    window.kicklinkTrack = (name, metadata) => sendAnalytics("USER_EVENT", name, metadata);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const element = target.closest<HTMLElement>("[data-analytics-event]");
      const name = element?.dataset.analyticsEvent;
      if (!element || !name) return;

      sendAnalytics("USER_EVENT", name, {
        label: element.dataset.analyticsLabel ?? element.textContent?.trim().slice(0, 80) ?? "",
        href: element instanceof HTMLAnchorElement ? new URL(element.href).pathname : "",
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
