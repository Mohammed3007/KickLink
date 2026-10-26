import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { isPlatformAdminUser } from "@/lib/admin";
import { analyticsReport, REPORT_RANGES, type DayPoint, type Ranked, type ReportRange } from "@/lib/analytics-report";
import { BackHeader } from "@/components/app/back-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Segment } from "@/components/ui/segment";

export const metadata = { title: "Analytics" };

const EVENT_LABELS: Record<string, string> = {
  "marketing.signup_cta_click": "Landing: sign-up button",
  "marketing.login_cta_click": "Landing: log-in button",
  "auth.google_click": "Continue with Google",
  "game.reserve_free_click": "Reserve a free spot",
  "game.reserve_pay_later_click": "Reserve, pay later",
  "game.join_paid_click": "Join a paid game",
  "game.pay_to_confirm_click": "Pay to confirm",
  "game.waitlist_click": "Join a waitlist",
  "game.offer_accept_click": "Accept a spot offer",
  "game.offer_accept_checkout_click": "Accept offer and pay",
  "game.offer_decline_click": "Decline a spot offer",
  "game.cancel_registration_click": "Cancel a registration",
};

const DEVICE_LABELS: Record<string, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Computer" };

const number = new Intl.NumberFormat("en-CA");
const dollars = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

function percent(part: number, whole: number) {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–";
}

function shortDay(day: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`)
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  if (!isPlatformAdminUser(user)) redirect("/home");

  const { range: rawRange } = await searchParams;
  const range = (REPORT_RANGES.find((r) => String(r) === rawRange) ?? 30) as ReportRange;
  const report = await analyticsReport(range);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <BackHeader title="Admin" />
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Analytics</h1>
            <p className="mt-1 text-ink-2">Traffic and activity across KickLink.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/applications">
              <Button variant="secondary">Applications</Button>
            </Link>
            <Link href="/admin/audit">
              <Button variant="secondary">Audit history</Button>
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <Segment
            active={String(range)}
            options={REPORT_RANGES.map((r) => ({
              value: String(r),
              label: `${r} days`,
              href: `/admin/analytics?range=${r}`,
            }))}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Visitors" value={number.format(report.totals.visitors)} hint="Unique per day, added up" />
          <Stat label="Page views" value={number.format(report.totals.views)} />
          <Stat label="New accounts" value={number.format(report.product.newUsers)} />
          <Stat label="Registrations" value={number.format(report.product.registrations)} hint="Spots taken, not cancelled" />
        </div>

        <Card className="mt-4 p-5">
          <h2 className="font-semibold text-ink">Daily visitors</h2>
          <DailyChart series={report.series} />
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-semibold text-ink">Sign-up funnel</h2>
            <p className="mt-1 text-sm text-ink-3">Visitors at each step in this period.</p>
            <ol className="mt-4 space-y-3">
              <FunnelStep label="Saw the landing page" value={report.funnel.landing} base={report.funnel.landing} />
              <FunnelStep label="Opened the sign-up page" value={report.funnel.signup} base={report.funnel.landing} />
              <FunnelStep label="Created an account" value={report.funnel.accounts} base={report.funnel.landing} />
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink">Clubs and games</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
              <Fact label="New clubs" value={number.format(report.product.newClubs)} />
              <Fact label="Games posted" value={number.format(report.product.gamesCreated)} />
              <Fact label="Payments collected" value={dollars.format(report.product.revenueCents / 100)} />
              <Fact
                label="Organizer applications waiting"
                value={number.format(report.product.pendingApplications)}
                href={report.product.pendingApplications > 0 ? "/admin/applications" : undefined}
              />
            </dl>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RankedCard title="Top pages" unit="views" rows={report.topPages} empty="No page views yet." />
          <RankedCard
            title="Where visitors come from"
            unit="visitors"
            rows={report.referrers}
            empty="No visits from other sites yet. Direct visits and app links aren't listed."
          />
          <RankedCard
            title="Button taps"
            unit="taps"
            rows={report.events.map((r) => ({ ...r, label: EVENT_LABELS[r.label] ?? r.label }))}
            empty="No tracked buttons tapped yet."
          />
          <div className="grid gap-4">
            <RankedCard
              title="Devices"
              unit="visitors"
              rows={report.devices.map((r) => ({ ...r, label: DEVICE_LABELS[r.label] ?? r.label }))}
              empty="No visits yet."
            />
            <RankedCard
              title="Locations"
              unit="visitors"
              rows={report.places}
              empty="Locations appear once the app runs on Vercel."
            />
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-ink-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
          Analytics are anonymous: nothing is stored in visitors&apos; browsers, visits aren&apos;t linked
          to accounts, and visitor IDs change every day. Browsers that send Do Not Track or Global
          Privacy Control aren&apos;t counted. Data older than 13 months is deleted automatically.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-ink-2">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-3">{hint}</div>}
    </Card>
  );
}

function Fact({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="mt-0.5 text-xl font-bold text-ink">
        {href ? (
          <Link href={href} className="underline decoration-brand-600 underline-offset-4">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function FunnelStep({ label, value, base }: { label: string; value: number; base: number }) {
  const width = base > 0 ? Math.min(100, (value / base) * 100) : 0;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-2">{label}</span>
        <span className="font-semibold text-ink">
          {number.format(value)} <span className="font-normal text-ink-3">· {percent(value, base)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-2">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${width}%` }} />
      </div>
    </li>
  );
}

function RankedCard({ title, unit, rows, empty }: { title: string; unit: string; rows: Ranked[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-3">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink-2" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  {number.format(row.count)} <span className="sr-only">{unit}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DailyChart({ series }: { series: DayPoint[] }) {
  const max = Math.max(1, ...series.map((d) => d.visitors));
  const total = series.reduce((sum, d) => sum + d.visitors, 0);
  return (
    <div className="mt-4">
      {total === 0 ? (
        <p className="py-10 text-center text-sm text-ink-3">No visits in this period yet.</p>
      ) : (
        <div className="flex gap-3">
          <div className="flex h-40 flex-col justify-between text-right text-xs text-ink-3" aria-hidden>
            <span>{number.format(max)}</span>
            <span>0</span>
          </div>
          <div
            className="relative flex h-40 flex-1 items-end gap-[2px] border-b border-line"
            role="img"
            aria-label={`Daily visitors, ${shortDay(series[0].day)} to ${shortDay(series.at(-1)!.day)}. Peak ${number.format(max)}.`}
          >
            {series.map((d) => (
              <div
                key={d.day}
                tabIndex={0}
                className="group relative flex h-full min-w-0 flex-1 items-end outline-none"
              >
                <div
                  className="w-full rounded-t-[4px] bg-brand-500 transition-colors group-hover:bg-brand-700 group-focus-visible:bg-brand-700"
                  style={{ height: d.visitors > 0 ? `max(2px, ${(d.visitors / max) * 100}%)` : 0 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max -translate-x-1/2 rounded-lg bg-surface-2 px-3 py-2 text-xs shadow-card ring-1 ring-line group-hover:block group-focus-visible:block">
                  <div className="font-semibold text-ink">{shortDay(d.day)}</div>
                  <div className="text-ink-2">
                    {number.format(d.visitors)} visitors · {number.format(d.views)} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 flex justify-between pl-8 text-xs text-ink-3" aria-hidden>
        <span>{shortDay(series[0].day)}</span>
        <span>{shortDay(series.at(-1)!.day)}</span>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-2 hover:text-ink">Show as table</summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="text-ink-3">
              <tr>
                <th className="py-1 font-medium">Day</th>
                <th className="py-1 text-right font-medium">Visitors</th>
                <th className="py-1 text-right font-medium">Views</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {[...series].reverse().map((d) => (
                <tr key={d.day} className="border-t border-line-2">
                  <td className="py-1">{shortDay(d.day)}</td>
                  <td className="py-1 text-right">{number.format(d.visitors)}</td>
                  <td className="py-1 text-right">{number.format(d.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
