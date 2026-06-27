import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KickLink — Pickup soccer, organized",
    template: "%s · KickLink",
  },
  description:
    "Run private pickup soccer the easy way. Clubs, games, payments, waitlists and spot transfers — all in one clean app.",
};

export const viewport: Viewport = {
  themeColor: "#6E3BD8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
