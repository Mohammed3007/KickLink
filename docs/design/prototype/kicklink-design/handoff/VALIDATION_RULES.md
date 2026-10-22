# Validation Rules

Client validates for UX; **server re-validates everything**. Errors are inline + announced; multi-step
forms show an error summary (see ACCESSIBILITY).

## Auth
- Email: RFC-ish format; required; lowercased server-side.
- Password: ≥ 8 chars, ≥ 1 letter + ≥ 1 digit; confirm must match on reset.
- Verification code: 6 digits; expires (e.g. 10 min); resend rate-limited.
- Phone (optional): E.164; Canadian default `+1`.
- Display name: 2–40 chars; required before first join.

## Join / registration
- Must be authenticated + active org member (or valid invite) to join.
- Cannot register twice for the same event (blocked; surface existing).
- Guest add only if `allowGuests` and within `maxGuests`; guest name required at review/check-in.
- Pay-now: registration not Confirmed until server confirms payment.
- Capacity is server-checked at claim time; client `filledCount` is advisory only.

## Payment
- Amount = price × quantity (+fees, 0 MVP); display CAD 2-dp.
- Idempotency key required (= registrationId) on intent create + retries.
- No card data stored client-side; tokenized provider fields only.
- Refund amount ≤ amount actually paid; partial ≤ policy max.

## Waitlist / offer
- Join waitlist only when event `full` and waitlist not at capacity.
- Accept offer only while `spot_offered` and `now < offerExpiresAt`; accept is idempotent.
- Manual promotion skipping a higher-priority player requires a **reason** (audit).

## Transfer
- Initiate only if `transfers === allowed` and registration `confirmed`.
- Specific-player target must be an eligible org member, not already registered, meeting gates.
- Original registration stays `confirmed` until replacement `paid`; cancel-offer only while pending.
- Auto-expire transfer at `registration_closed`.

## Event creation (per step)
- Basics: title 3–80; format required; age min ≤ max.
- Schedule: startAt in future; arriveAt ≤ startAt; duration 15–240 min; recurrence end required if recurring.
- Venue: name + address required; lat/lng from picker.
- Capacity: ≥ 1; waitlistCapacity ≥ 0; cannot publish capacity below current filledCount (edit case → guarded).
- Payment: price ≥ 0 (=0 implies free); pay-later requires paymentDeadlineHrs ≥ 1; fees ≥ 0.
- Refund: deadlineHrs ≥ 0; partialPct 0–100.
- Visibility + transfer flags required (have defaults).
- Review: block publish until all required valid; show error summary.

## Organizer application
- Required: legalName, displayName, email, phone, orgName, city, description (≥ 20 chars),
  expectedPlayers ≥ 1, expectedGames ≥ 1, collectsMoney (bool), agreement accepted (true).
- Verification handled by provider; app cannot mark itself verified.

## Admin high-risk actions
- Approve/reject/suspend, refund override, ban, capacity reduction, price change, staff-permission
  change, skip-waitlist: require confirmation; **written reason mandatory** where PERMISSION_MATRIX
  marks it; all audit-logged.

## General
- All status writes must use the enum values in STATUS_MODEL — reject unknown strings.
- Money/time immutable on settled records; changes apply forward only.
- Mutating actions disabled while offline; show OfflineBanner.
