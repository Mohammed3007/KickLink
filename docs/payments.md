# Payments

Phase 1 intentionally ships only a mock payment boundary.

- `packages/shared/src/payment.ts` defines `PaymentProvider`.
- `MockPaymentProvider` supports the documented payment statuses: `not_required`, `unpaid`, `payment_due`, `processing`, `paid`, `failed`, `partially_refunded`, `refunded`, and `disputed`.
- The mobile checkout screen never collects card data.
- No Stripe secret keys are present in this repository.

Future Stripe Connect integration belongs behind the same provider boundary. Card entry must use
Stripe-hosted/tokenized components, payment confirmation must be server-authoritative, and webhook
handlers must be idempotent before any registration is displayed as confirmed.
