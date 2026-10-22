# Spot Transfer / Offer Flow

A confirmed player who can't attend passes their place safely. **The original keeps their spot until
the replacement successfully pays** — only then is it transferred and the original refunded/credited.

## Initiate
```
Registration details → "Offer or transfer my spot"
   ├─ destination: To the waitlist  |  To a specific eligible member (search org members)
   ├─ shows refund/transfer rules (is refund guaranteed? per policy)
   └─ confirm
        v
   transfer_pending (original still Confirmed)
   ├─ organizer approval required?  → awaits organizer (SPOT_TRANSFER approval screen on web/mobile)
   └─ automatic                      → straight to replacement offer
```

## Complete
```
Replacement gets offer → accepts → PAYMENT_FLOW (pays current price)
   ├─ success → transfer the spot → cancel original registration
   │            → refund/credit original per policy → notify both → participant list updates → audit
   └─ no pay in window → offer expires → original remains Confirmed → notify
```

## Transfer-status timeline (player view)
`Spot offered → Organizer approval (if required) → Replacement accepts & pays → Transfer complete
(you're refunded $N)`. Player can **cancel the offer** while `transfer_pending` (not after replacement pays).

## Options (per event)
offer-to-waitlist · transfer-to-specific-player · organizer-approval-required vs automatic ·
transfer deadline · transfer fee (**future**) · no-transfer-permitted · original-responsible-until-paid.

## Edge cases (see EDGE_CASES)
replacement doesn't pay · replacement already registered/ineligible · event starts before completion
(auto-expire at registration_closed) · organizer cancels event mid-transfer (refund both) · original
changes mind · refund fails · price changed / discount used (refund computed on amount actually paid)
· guest registration transfer · multiple claimers (one active offer, first-write-wins) · offer close
to kickoff (tight-window warning).
