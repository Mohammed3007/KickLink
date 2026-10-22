# MVP Scope

The design shows the full long-term vision. This file defines the **functional MVP** Codex builds first.

## In MVP

### Accounts & onboarding
- Email + password and **Sign in with Apple**
- Email verification, forgot/reset password
- Notification-permission request
- Basic profile (name required; photo, position, skill optional)
- Terms & privacy acceptance

### Organizations
- Private orgs only; join via **invite link** or **organization ID**
- Membership approval (when org requires it)
- Org detail, game list, announcements
- Leave org; handle removed/suspended membership

### Organizer application & approval
- Player applies → platform admin reviews → approve / reject / request more info / suspend
- Verification represented as a **placeholder** for a trusted provider

### Games
- One-time games + **recurring series** (with edit-one vs edit-series)
- Free / pay-immediately / join-now-pay-later models
- Capacity + waitlist capacity
- Game detail, participant list (respecting visibility), rules, policy, directions, calendar, WhatsApp link

### Registration & payment (mocked provider)
- Join free / pay now / pay later; registration review with policy shown **before** paying
- Guest registration (when allowed)
- Apple Pay + card (Stripe-hosted, tokenized)
- **Server-confirmed** result (never confirm from a UI animation)
- Duplicate-registration prevention; capacity-lost-at-checkout handling
- Payment history, receipts, refund request + status

### Waitlist
- Join, position, position-changed
- **Manual** promotion (organizer selects) **and optional automatic** offer-to-next
- Spot-offer countdown, accept/decline, expiry → next person

### Spot offering & transfer
- Offer to waitlist or transfer to a specific eligible member
- Organizer-approval or automatic
- **Original stays registered until replacement pays**, then refund/credit per policy
- Transfer pending / complete / failed / expired / cancelled

### Communication
- Push notifications + in-app notification centre + preferences
- Organizer announcements
- WhatsApp group/event links & event sharing; copy invite link / event ID

### Organizer
- Mobile workspace: today's games, urgent actions, fast check-in, no-show, walk-in/offline-paid, last-minute announcement
- Web dashboard: events, registrations, waitlists, spot offers, transfers, attendance, payments, unpaid, refunds, payouts, basic reports/exports, members + approvals, staff + permissions, org settings, invite links/IDs, audit activity
- Role-based permissions enforced server-side

### Platform admin
- Overview, organizer applications + detail/verification, organizations, events, users, payments,
  refunds, payouts, disputes, reports, reliability reviews, support cases, suspensions/bans,
  sports & categories, cities & venues, platform settings, admin accounts, roles, **audit logs**, analytics
- High-risk actions: confirmation + written reason + impact note + audit entry + permission check

### Cross-cutting
- One **status model** (registration / payment / refund / event separate) — see `STATUS_MODEL.md`
- Internal **reliability indicators** (private; no public score)
- **Audit logging** of financial & administrative actions
- Support & reporting (report user/org/event)

## Explicitly NOT in MVP (later phases)

Public game discovery · search by city · map view · account credits · promo codes (UI present but
future-ready/disabled) · organizer subscriptions · platform transaction fees · advanced analytics ·
transfer marketplace · player favourites · venue management · multi-sport · team registration ·
tournament brackets · standings · player statistics · full league management.

Mark these in code behind a `features` flag object so the UI can show "coming soon" affordances
without dead navigation.

## MVP acceptance bar

- A guest can sign up, join an org by ID, register + pay for a game with Apple Pay, and see a
  **server-confirmed** Confirmed + Paid registration with a receipt.
- A player can join a full game's waitlist, receive a spot offer with a live countdown, accept, pay,
  and become Confirmed — with no possibility of two players claiming the same final spot.
- A confirmed player can offer their spot; the original stays registered until the replacement pays.
- An organizer can create a recurring game, check players in on mobile, and issue a refund on web.
- A platform admin can approve an organizer application with an audit-logged decision.
