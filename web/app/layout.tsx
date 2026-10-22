import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/space-grotesk";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KickLink — Pickup soccer, organized",
    template: "%s · KickLink",
  },
  description:
    "Run private pickup soccer the easy way. Clubs, games, payments and waitlists — all in one clean app.",
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
