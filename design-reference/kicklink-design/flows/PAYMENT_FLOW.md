# Payment Flow

**Mocked provider in the prototype; Stripe intended.** No raw card data touches the app — use
Stripe-hosted, tokenized components. The **server confirms** the final result via webhook; the client
never shows Confirmed from an animation.

## Checkout
```
Checkout
  ├─ method: Apple Pay (default) | saved card | add card (Stripe-hosted)
  ├─ order summary + total (CAD) + fee line (0 in MVP but present)
  ├─ policy restated
  └─ Pay
       ├─ Apple Pay → ApplePaySheet: confirm → Face ID auth → done
       └─ Card → processing spinner
                 v
        create PaymentIntent (idempotency key = registrationId)
                 v
        ┌──────── provider result ────────┐
        success(requires_capture/captured)  failure        requires_action(3DS/verification)
                 v                            v                     v
        server marks paid (webhook)      Payment failure      Additional verification
                 v                        (retry / change       (provider UI) → back to result
        Success screen                     method)
        Confirmed + Paid + receipt
```

## States
not_required · unpaid · payment_due · **processing** (session open / webhook pending) · **paid**
(server-confirmed) · **failed** · partially_refunded · refunded · disputed. (See STATUS_MODEL.)

## Reliability rules (priority #1)
- **Idempotent**: retrying a charge with the same key never double-charges; webhooks are idempotent.
- **Connection lost after pay**: on relaunch, client reconciles; shows `processing` reconciliation
  banner until the server resolves to `paid`+Confirmed or auto-refund.
- **Capacity hold**: a short hold may reserve the spot during checkout; on failure/timeout the hold
  releases and the spot returns to pool / next offer.
- **Charged but not registered**: never strand the user — reconcile to Confirmed or auto-refund;
  surface a support path.
- **Duplicate webhook**: no-op; one receipt, one notification.

## Receipts & history
Every captured payment → receipt (game, org, amount, method, date, status) in Payments & receipts.
Refund/partial-refund/dispute states reflected there and in registration details.

## Apple Pay sheet (visual)
confirm → "Confirm with Face ID" → auth pulse → green check "Done" → dismiss → Success. Cancellable
only at the confirm stage.
