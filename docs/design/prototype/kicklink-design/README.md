# KickLink — Design & Implementation Reference

KickLink is an **iOS-first platform for private pickup-soccer organizations**. It replaces the
WhatsApp + Interac e-Transfer process with one system for publishing games, collecting payments,
managing registrations and waitlists, offering/transferring spots, sending announcements and
tracking attendance.

This repository is the **source-of-truth design reference** for three implementation targets:

| Target | Stack (intended) | Role |
| --- | --- | --- |
| Player + Organizer mobile app | Expo React Native (iOS) | Players join/pay/waitlist; organizers run match-day ops |
| Organizer dashboard | Next.js (web) | Event ops, registrations, payments, refunds, payouts |
| Platform-admin dashboard | Next.js (web) | Organizer approval, safety, finance, audit |

---

## What's in this package

```
kicklink-design/
├── README.md                ← you are here
├── product/                 ← what to build & the rules
│   ├── PRODUCT_OVERVIEW.md
│   ├── MVP_SCOPE.md
│   ├── USER_ROLES.md
│   ├── PERMISSION_MATRIX.md
│   ├── STATUS_MODEL.md
│   ├── EDGE_CASES.md
│   └── ROADMAP.md
├── design-system/           ← how it looks & a11y
│   ├── TOKENS.md
│   ├── COMPONENTS.md
│   ├── ACCESSIBILITY.md
│   └── CONTENT_STYLE.md
├── flows/                   ← step-by-step user flows + state machines
│   ├── AUTH_FLOW.md
│   ├── PLAYER_REGISTRATION_FLOW.md
│   ├── PAYMENT_FLOW.md
│   ├── WAITLIST_FLOW.md
│   ├── SPOT_TRANSFER_FLOW.md
│   ├── REFUND_FLOW.md
│   ├── ORGANIZER_APPLICATION_FLOW.md
│   └── EVENT_CREATION_FLOW.md
├── mobile/
│   ├── PLAYER_SCREEN_INVENTORY.md
│   └── ORGANIZER_SCREEN_INVENTORY.md
├── web/
│   └── WEB_SCREEN_INVENTORY.md
└── handoff/                 ← Codex implementation contract
    ├── DEVELOPER_HANDOFF.md
    ├── ROUTE_MAP.md
    ├── COMPONENT_MAP.md
    ├── DATA_REQUIREMENTS.md
    ├── VALIDATION_RULES.md
    ├── NOTIFICATION_TRIGGERS.md
    └── IMPLEMENTATION_PRIORITY.md
```

## The visual prototypes

- **`KickLink Player App.html`** (+ `kl-*.jsx`) — interactive iOS player prototype. Runs in any
  browser, no build step. Player core: home, game details, join → Apple Pay → confirmed, waitlist +
  spot-offer countdown, offer/transfer, registration management, notifications, profile.
- **`KickLink Organizer Dashboard.html`** (+ `kl-dash-organizer.js`) — responsive organizer web
  dashboard: overview, games, registrations, waitlists, transfers, attendance, payments, refunds,
  payouts, members, staff & permissions, audit.
- **`KickLink Platform Admin Dashboard.html`** (+ `kl-dash-admin.js`) — platform-admin dashboard:
  organizer applications + approval (with the high-risk confirmation pattern: impact + mandatory
  audit reason), organizations, users, finance, disputes, trust & safety, audit logs.

Treat these as the **canonical look, motion and interaction spec**.

> **Note on the prototype stack.** The prototype is delivered as browser-runnable HTML + JSX
> (no build step) so it previews instantly. The production app should be re-implemented in Expo
> React Native using the tokens in `design-system/TOKENS.md` and the component contracts in
> `handoff/COMPONENT_MAP.md` — do not port the prototype's CDN/Babel setup into production.

## How Codex should read this

1. Start with `product/PRODUCT_OVERVIEW.md` and `product/MVP_SCOPE.md` — scope.
2. Read `product/STATUS_MODEL.md` and `product/PERMISSION_MATRIX.md` — the two hardest-to-retrofit decisions.
3. Read `handoff/IMPLEMENTATION_PRIORITY.md` — build order.
4. Per screen, use `mobile/*_INVENTORY.md` + `web/WEB_SCREEN_INVENTORY.md` for the contract, and the prototype for the visual.
5. Use `flows/*` for the state machines behind payments, waitlists and transfers.

## Non-negotiable product principles (priority order)

1. **Payment & registration clarity** — a paid player must never lose a spot to a UI error.
2. **No double-booking** — the server is the source of truth for capacity; spot-claim is idempotent.
3. **Fast organizer workflows** — match-day check-in must be a few taps.
4. **Clear waitlist & transfer behaviour** — the original spot is held until a replacement *pays*.
5. **Privacy & permissions** — enforced server-side, not just hidden in the UI.
6. **Accessibility** — WCAG contrast, Dynamic Type, VoiceOver, reduced motion.
7. **Native iOS feel.**
8. **Maintainable handoff.**
9. **Visual polish.**

## Known limitations of this package

- The prototype covers the **player** core flows visually; organizer-mobile and the two web
  dashboards are specified in docs + delivered as separate HTML mockups (not inside the iOS prototype).
- No production payment code. All payment/refund/payout states are **mocked**; Stripe is the
  intended provider and all card capture must use Stripe-hosted, tokenized components.
- Identity/business verification is represented as a **placeholder** for a trusted KYC provider —
  no document upload is collected insecurely.
