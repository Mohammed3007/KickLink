# Developer Handoff

This is the per-screen contract template + global build notes. Screen lists live in the inventories
(`../mobile/*`, `../web/*`); per-screen detail follows this template.

## Per-screen contract template
For every screen, capture:
- **Screen name / Route** (see ROUTE_MAP)
- **Role** (guest/player/organizer+permission/admin)
- **Purpose**
- **Entry points / Exit destinations**
- **Required data / Optional data** (see DATA_REQUIREMENTS)
- **Loading / Empty / Filtered-empty / Error / Offline** states
- **Permission requirements** (PERMISSION_MATRIX)
- **Primary action / Secondary actions / Destructive actions**
- **Validation rules** (VALIDATION_RULES)
- **Confirmation requirements**
- **Statuses shown** (STATUS_MODEL)
- **Notification triggers** (NOTIFICATION_TRIGGERS)
- **Analytics events**
- **Accessibility notes** (ACCESSIBILITY)
- **Reusable components used** (COMPONENT_MAP)

## Worked example — Game Details (player)
- **Route:** `/games/:gameId` · **Role:** player (guest = read-only)
- **Purpose:** decide to join/waitlist; see when/where/price/policy/players.
- **Entry:** Home, Games list, Org game list, deep link. **Exit:** Join Review, Waitlist Confirm,
  Registration details, Participants, Org detail, Share.
- **Required:** game (status, schedule, venue, price, model, capacity, filled, policy, transfers,
  confirmed[], waitlist count). **Optional:** your registration.
- **States:** loading (skeleton hero+cards) · cancelled (read-only banner) · full (Join waitlist CTA)
  · registration_closed (disabled CTA) · offline (CTA disabled).
- **Primary:** context CTA (Join $N / Reserve / Confirm free / Join waitlist / View registration).
  **Secondary:** Share, directions, players, WhatsApp. **Destructive:** none here.
- **Confirmation:** none to view; policy shown before payment downstream.
- **Statuses shown:** event + (if registered) registration + payment badges.
- **Notifications:** none triggered from view.
- **A11y:** hero stripes decorative/hidden; CTA labels include amount; capacity has text label.
- **Components:** AppHeader, Card, MetaRow, CapacityBar, StatusBadge, Avatar stack, FooterCTA, Button.

## Global build notes
- **Server is source of truth** for capacity/registration/payment; client reconciles, never asserts.
- **Idempotency** keys on register, pay, accept-offer, refund.
- **Status is 4 separate enums**; render registration + payment as two badges.
- **Permissions enforced server-side**; UI hides but API re-checks.
- **Audit log** every financial/admin/safety mutation with actor, action, target, reason, timestamp.
- **Feature flags** gate Phase 2/3 UI; no dead navigation.
- **Times** stored UTC + venue tz; rendered in venue local time.
- **Money** records carry gross/fee/net/currency (fee=0 in MVP).

## Prototype → production mapping
- Tokens: `kl-kit.jsx` `KL` object → `design-system/TOKENS.md` → typed `tokens` (RN) + CSS vars (web).
- Components: `KL*` symbols → `COMPONENT_MAP.md` production names + SF Symbols.
- Screens: `Screen*` in `kl-screens-*.jsx` → `ROUTE_MAP.md`.
- Mock data: `kl-data.jsx` → `DATA_REQUIREMENTS.md` entities → mock service layer.
