# Player Registration Flow

Covers the three event models. Server is authoritative for capacity; registration is idempotent.

## Entry
Home urgent card · Games list · Org game list · Game details · invite/event deep link.

## Game details → branch by state
```
Game details
 ├─ open + pay-now      → Join Review → Checkout → (PAYMENT_FLOW) → Success(Confirmed+Paid)
 ├─ open + pay-later    → Join Review → reserve  → Success(Provisional, deadline) ── later → Checkout
 ├─ open + free         → Join Review → confirm  → Success(Confirmed, not_required)
 ├─ full                → Waitlist Confirm → (WAITLIST_FLOW)
 ├─ registration_closed → read-only ("Registration closed")
 ├─ cancelled           → read-only ("Cancelled") + refund info if was registered
 └─ already registered  → Registration details (no re-join)
```

## Join Review (always before payment)
Shows: game summary, optional **guest** add (if allowed, +price each), price breakdown,
**cancellation/transfer policy** (must be visible before paying), totals in CAD.
- Pay-now CTA: "Continue to payment · $N.00".
- Pay-later CTA: "Reserve spot" + note "Pay within Xh or it's released".
- Free CTA: "Confirm free spot".

## Guest registration
Toggle "Bring a guest" (when `allowGuests`). Guest may require name/identity at review or check-in;
guest spot is its own line item; transfer of a guest spot only if organizer permits.

## Provisional → paid
Provisional registration shows a live **payment deadline**; reminders fire (NOTIFICATION_TRIGGERS);
on deadline the spot may auto-release to the waitlist; organizer may remove unpaid manually.

## Registration details (post-join)
Status block (registration + payment as two badges), QR check-in (confirmed only), add-to-calendar,
directions, players, and **Manage**: offer/transfer (if allowed), view receipt (if paid),
cancel registration.

## Key states
review (idle/validating) · checkout (see PAYMENT_FLOW) · success(confirmed) · success(provisional) ·
duplicate-warning · capacity-lost · error · offline (disable join).

## Edge cases (see EDGE_CASES)
capacity lost at checkout · charged-but-missing → reconcile · register-twice blocked ·
price changed for provisional → re-accept · membership removed → honour existing.
