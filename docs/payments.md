# Payments

The current web milestone intentionally ships without live payment processing.

- `packages/shared/src/payment.ts` defines `PaymentProvider`.
- `MockPaymentProvider` supports the documented payment statuses: `not_required`, `unpaid`, `payment_due`, `processing`, `paid`, `failed`, `partially_refunded`, `refunded`, and `disputed`.
- Free game registration creates real `registrations` records with `payment_status = 'not_required'`.
- Paid games, checkout sessions, refunds, and disputes are not live yet.
- No Stripe secret keys are present in this repository.

Future Stripe Connect integration belongs behind the same provider boundary. Card entry must use
Stripe-hosted/tokenized components, payment confirmation must be server-authoritative, and webhook
handlers must be idempotent before any registration is displayed as confirmed.

## Direction

KickLink should use Stripe Connect with organizer-owned connected accounts. Player game fees should
go to the organizer's connected account rather than being held as normal KickLink operating revenue.

The likely production architecture is Connect direct charges:

- Each approved organization owner completes Stripe onboarding.
- KickLink stores the organization's `stripe_account_id`.
- Player payments are created server-side on the connected account.
- KickLink can collect an application fee later if the business model requires it.
- Refunds and chargebacks are modeled as connected-account responsibility and mirrored in
  KickLink's `payments`, `refunds`, and `audit_log_entries` tables.

Do not add Apple Pay to the web app at this stage. Web checkout should use Stripe's browser-capable
payment methods once the Connect integration is approved for implementation.
