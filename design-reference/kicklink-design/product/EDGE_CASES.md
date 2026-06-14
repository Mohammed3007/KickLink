# Edge Cases

Each case: **trigger → required behaviour → UI surface**. Server is source of truth; client never
confirms a spot from an animation. Spot-claim and payment are **idempotent**.

## Capacity & concurrency
- **Two players check out for the last spot.** Server grants the spot to the first idempotent
  payment confirmation; the second sees `capacity_lost` → not charged (or auto-refunded if a hold
  captured) → offered the waitlist. UI: "This spot was just taken — join the waitlist?"
- **Organizer reduces capacity below current registrations.** Block silent removal: warn with count,
  require confirmation + reason, and require the organizer to *choose whom to move to waitlist*
  (most-recent-first default). Audit-logged.
- **Organizer changes price after registrations.** Existing confirmed/paid are unaffected; new price
  applies to new registrations. Provisional (unpaid) players are notified and must accept the new
  price or cancel. Audit-logged + reason.

## Payment reliability
- **Payment succeeds but app loses connection.** On reconnect, client reconciles via server; shows
  `processing` until webhook confirms, then `paid` + Confirmed. Never shows Confirmed pre-confirmation.
- **Payment fails after a temporary capacity hold.** Hold is released after TTL; spot returns to pool
  or next waitlist offer. UI: payment-failure screen with retry.
- **Player charged but registration appears missing.** Show `processing` reconciliation banner +
  "We're confirming your payment" with support link; resolve to Confirmed or auto-refund. Idempotency
  key prevents a second charge on retry.
- **Late / duplicate webhook.** Idempotent handler; duplicates are no-ops. No duplicate receipts/notifs.
- **App closes during checkout.** Resume into the pending registration on next launch (home urgent card).

## Duplicate / eligibility
- **Player registers twice.** Blocked; surface existing registration ("You're already registered").
- **Waitlisted player becomes ineligible** (removed from org, age/skill gate). Skip in offer order;
  notify; remove from waitlist with reason.
- **Replacement already registered / ineligible** during transfer. Reject the transfer target; keep
  original registered; prompt to pick another.

## Waitlist & offers
- **Player misses offer deadline.** Offer expires → next eligible player; original waitlister returns
  to (or leaves) the queue per config. UI: "Offer expired."
- **Two players try to claim the same offered spot.** Only one active offer per freed spot; accept is
  idempotent + first-write-wins. Loser sees `offer_expired`/`spot_taken`.
- **Game cancelled while player waitlisted.** Close waitlist, cancel scheduled offers, notify.
- **Player joins multiple waitlists with overlapping times.** Allowed, but warn on the second offer
  accept that it conflicts with another confirmed game.

## Spot offer / transfer
- **Original stays registered until replacement pays.** Only on replacement success: transfer the
  spot, then refund/credit original per policy. Both notified; participant list updates; audit entry.
- **Replacement doesn't pay in window.** Offer expires; original remains confirmed; organizer/player notified.
- **Event starts before transfer completes.** Auto-cancel the pending transfer at registration_closed;
  original keeps the spot. UI: "Transfer expired — kickoff passed."
- **Organizer cancels event during a pending transfer.** Cancel transfer; original and replacement
  both refunded per cancellation rules.
- **Original changes mind.** Can cancel the offer while `transfer_pending` (not after replacement pays).
- **Player used a discount / price changed.** Replacement pays current price; original's refund is
  computed on what they actually paid. Surface the delta.
- **Transfer initiated for a guest registration.** Allowed only if organizer permits; guest identity
  re-collected from replacement.
- **Player offers a spot minutes before kickoff.** Allowed until registration_closed; show "tight
  window" warning; if no replacement, normal cancellation policy applies.

## Membership & accounts
- **Membership removed after registration.** Existing registrations honoured unless organizer cancels
  them explicitly (with refund); player loses future visibility of the org.
- **Organizer suspended before an event.** Event continues read-only; platform admin or co-organizer
  handles refunds/cancellation; players notified if affected.
- **Assistant organizer opens restricted financials.** Permission-denied state (not a blank table);
  audit-log the attempt.
- **Player deletes account with an upcoming paid registration.** Block hard-delete; require cancel
  (with refund per policy) or completion first; offer data export. Soft-anonymize after.
- **Organizer deletes an org with future events.** Block until future events are cancelled/refunded.

## Refunds
- **Refund requested after policy deadline.** Show policy; allow "request exception" → organizer/admin review.
- **Refund provider fails.** `refund.failed`; retry + escalate to admin dispute queue; player informed.
- **Offline payment marked incorrectly.** Organizer can reverse the offline-paid mark (audit-logged);
  reconcile player's payment status.
- **Guest and host both try to cancel the same registration.** First write wins; second sees current state.

## Notifications / environment
- **Push disabled.** In-app banner explaining critical alerts may be missed + deep link to iOS settings.
- **Invite link expired / revoked.** Friendly "This invite is no longer active" + ask org for a new one.
- **Invalid event/org ID.** Inline validation error; no navigation.
- **Poor connection / partial outage.** Skeleton → cached data + offline banner; disable mutating
  actions with "You're offline" toast.
- **Daylight-saving / time-zone change.** Store UTC + venue time zone; render in venue local time with
  tz label; recompute reminders/deadlines on tz rules change.
- **Currency/tax rules change (future).** Amounts are immutable on existing registrations; new rules
  apply forward only.
- **Account deletion / data export request.** Self-serve export; deletion via the guarded flow above.
- **Permission denied (any).** Dedicated state with reason + who to contact, never a silent blank.
- **Empty / loading states.** Every list/table specifies an empty, filtered-empty, loading (skeleton) state.
