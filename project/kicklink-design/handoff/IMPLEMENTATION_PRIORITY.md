# Implementation Priority

Build order that de-risks the hard parts (money, concurrency, permissions) first. Each milestone is
shippable/testable on its own.

## M0 — Foundations
- Design tokens (typed module + CSS vars), base components (Button, Card, ListRow, StatusBadge,
  AppHeader, TabBar, FormField, Sheet, Toast, EmptyState, Spinner).
- Mock service layer + entities (DATA_REQUIREMENTS) with the required dataset.
- Routing skeleton (ROUTE_MAP) for player tabs; auth shell.
- Status enums + the 4-dimension status system as a shared module.

## M1 — Account & org access
- Auth (email + Apple), verification, profile setup, terms.
- Join org by ID / invite link; membership states; org detail + game list + announcements.

## M2 — Games & registration (the core)
- Game details (all event states), participants (visibility), policy display.
- Join Review → **free / pay-later** first (no money), then **pay-now** with mocked payment.
- Registration details (two-badge status), cancel + cancellation-policy confirm.
- **Server-authoritative capacity + idempotent register** (build the concurrency guard here).

## M3 — Payments hardening
- Payment flow states (processing/paid/failed/verification), receipts, reconciliation after outage,
  duplicate-webhook idempotency. Refund request + status tracker.

## M4 — Waitlist & offers
- Join waitlist, position, manual promotion, automatic offer + countdown, accept/decline/expire.
- One-active-offer guarantee + idempotent accept (second concurrency guard).

## M5 — Spot offer / transfer
- Offer to waitlist / specific player, approval vs auto, transfer-pending timeline,
  original-held-until-paid, complete/fail/expire/cancel.

## M6 — Organizer
- Mobile workspace: today's games, fast check-in, no-show, walk-in/offline-paid, last-minute announce.
- Web dashboard: events + create/recurring, registrations, waitlists, offers, transfers, attendance,
  payments/unpaid, refunds, payouts, members + approvals, staff + permissions, reports/exports,
  audit, settings. **Permissions enforced server-side.**

## M7 — Platform admin
- Organizer applications + approval (audit-logged), organizations, users, payments, refunds, payouts,
  disputes, reliability reviews, support, suspensions/bans, reference data, audit logs, analytics.

## M8 — Polish & a11y
- Reduced motion, Dynamic Type XXL, VoiceOver pass on core flows, keyboard pass on dashboards,
  offline states, skeletons, error states. Notification triggers wired (NOTIFICATION_TRIGGERS).

## Cross-cutting from day 1
Audit logging on every financial/admin/safety mutation · feature flags for Phase 2/3 · UTC+venue tz
times · gross/fee/net money records · idempotency keys on register/pay/accept/refund.

## Definition of done (MVP) — see MVP_SCOPE acceptance bar
Join→ApplePay→server-confirmed; full→waitlist→offer→countdown→accept→pay→confirmed (no double-sell);
offer-spot keeps original until replacement pays; organizer recurring + mobile check-in + web refund;
admin approves organizer with audit-logged decision.
