# Refund & Cancellation Flow

Policy is set per event by the organizer. Registration vs payment vs refund statuses stay separate.

## Player-initiated cancellation
```
Registration details → Cancel registration
   → Cancellation-policy confirmation (shows exact refund outcome for THIS timing)
      ├─ before deadline + paid  → full/partial refund per policy → refund: processing → completed
      ├─ after deadline          → no refund (offer "request exception" → organizer/admin review)
      ├─ provisional/unpaid      → spot released to waitlist (no money movement)
      └─ free                    → spot released
   → registration: cancelled; payment: refunded/partially_refunded as applicable
```
Tip surfaced: "Offer your spot instead" for a faster outcome when someone takes it.

## Refund request (when not auto-eligible)
`Request refund → reason → refund: requested → under_review → approved|rejected → processing →
completed|failed`. Player sees a refund-status tracker; organizer/admin acts in dashboard.

## Refund policy options (per event)
full-before-deadline · partial-before-deadline · no-refund-after-deadline · organizer-review-required
· account-credit (**future**) · refund-only-if-spot-filled · special-exception-request ·
auto-refund-on-organizer-cancel · platform-admin dispute review.

## Organizer cancels an event (see ORGANIZER side)
Registrants notified · **appropriate refunds auto-initiated** · waitlist closed · scheduled reminders
cancelled · event stays in history · financial records retained.

## Organizer reschedules
Players notified · can **reconfirm** or request cancellation · organizer sees reconfirm count · original
details retained in audit history.

## Failure & integrity
- `refund.failed` → retry + escalate to platform-admin dispute queue; player informed.
- Refund amount computed on **what the player actually paid** (after discounts), not list price.
- Offline-paid reversal is possible (audit-logged) and reconciles payment status.
- High-risk/override refunds (admin) require confirmation + written reason + audit entry.
