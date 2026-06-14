# Waitlist Flow

Two modes per event: **manual** (organizer selects/promotes) and optional **automatic** (offer to
next in order). No final spot is ever sold twice — accept is idempotent, first-write-wins.

## Join
```
Full game → Waitlist Confirm (shows your position #N, how it works, "no charge to wait")
          → Join waitlist (free) → Waitlist Position (#N)
```

## Position lifecycle
`waitlisted(#N)` → position changes as others leave/are promoted → notification "moved up to #k".

## A spot frees up
```
Confirmed player cancels / is removed / transfers out
            v
 ┌─ MANUAL: organizer opens waitlist, selects a player (may skip — warning + reason → audit)
 └─ AUTO:   system offers to first eligible
            v
   Player receives Spot Offer (push + home urgent card + notification)
            v
   Spot Offer screen: big countdown (offerExpiresAt), price, policy
     ├─ Accept & pay → PAYMENT_FLOW → Promoted & Confirmed
     ├─ Decline      → offer passes to next eligible
     └─ Timer expires → offer_expired → next eligible (loop until filled or waitlist exhausted)
```

## Statuses surfaced
waitlisted · position_changed · spot_offered (offer_pending) · offer_accepted → payment_required →
promoted_confirmed · offer_declined · offer_expired · removed_from_waitlist.

## Rules & edge cases
- **One active offer per freed spot.** Concurrency: accept is idempotent; a second claimer sees
  `spot_taken`/`offer_expired`.
- **Eligibility re-checked at offer time** (membership, age/skill, not already registered). Ineligible
  → skipped, notified.
- **Game cancelled while waitlisted** → waitlist closed, scheduled offers cancelled, notify.
- **Overlapping waitlists**: allowed; warn on accept if it conflicts with another confirmed game.
- **Manual skip** requires a reason recorded to the audit log.
- Player can **leave the waitlist** anytime (no charge).
