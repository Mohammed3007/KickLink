# Data Requirements

Entities the prototype mocks (`kl-data.jsx`) and the production schema needs. Money fields carry
`gross/fee/net/currency` (fee=0 MVP). Times: UTC + `venueTimeZone`. All IDs stable + opaque.

## User
`id, displayName, legalName?, email, phone?, photoUrl?, position?, skillLevel?, city,
memberSince, roles[] (player|organizer|admin), reliability {indicator, gamesAttended, lateCancels,
noShows, missedPayments}, notificationPrefs{}, privacyVisibilityDefault, createdAt`
Sensitive (email, phone, payment, reliability detail) never exposed to other players.

## Organization
`id, name, handle (org ID e.g. WSL-4471), city, venueDefault?, logoUrl?, coverUrl?, blurb,
membersCount, isPrivate, requiresApproval, whatsappUrl?, ownerId, staff[] {userId, permissions[]},
inviteLinks[] {token, expiresAt?, revoked}, createdAt`

## Membership
`id, orgId, userId, status (pending|active|removed|suspended), role (player|organizer-staff),
joinedAt`

## Event (Game)
`id, orgId, type (pickup|training|tournament*|league*), title, status (draft|published|almost_full|
full|registration_closed|cancelled|completed), format, skillLevel, ageRestriction?,
startAt(UTC), arriveAt, durationMin, venueTimeZone, venue {name, address, lat, lng, directionsNote},
recurrence? {freq, byDay, until|count, seriesId}, capacity, filledCount, waitlistCapacity,
waitlistMode (manual|automatic), waitlistDeadlineMin, model (free|pay_now|pay_later),
price, fees?, paymentDeadlineHrs?, allowGuests, maxGuests, transfers (none|allowed),
transferApproval (manual|auto), refundPolicy {type, deadlineHrs, partialPct?, onlyIfFilled?},
visibility (full|first_photo|name_only|count_only|hidden), rules, equipmentNote,
inviteOnly, eventId (public code e.g. WSL-G-7741), createdBy, createdAt`

## Registration
`id, eventId, userId, kind (self|guest), guestInfo?, regStatus (pending|provisional|confirmed|
waitlisted|spot_offered|transfer_pending|cancelled|attended|no_show), payStatus (not_required|unpaid|
payment_due|processing|paid|failed|partially_refunded|refunded|disputed), waitlistPosition?,
offerExpiresAt?, paymentDeadlineAt?, amountPaid?, paymentMethod?, idempotencyKey, createdAt, updatedAt`

## Payment
`id, registrationId, userId, eventId, orgId, gross, fee, net, currency (CAD), method (apple_pay|card|
offline), status, providerIntentId?, receiptUrl?, createdAt`

## Refund
`id, paymentId, amount, reason?, status (requested|under_review|approved|rejected|processing|
completed|failed), requestedBy, decidedBy?, decisionReason?, createdAt`

## Transfer
`id, eventId, fromUserId, toTarget (waitlist|userId), status (transfer_pending|approval_pending|
replacement_pending|complete|failed|expired|cancelled), approvedBy?, replacementRegistrationId?,
deadlineAt, createdAt`

## WaitlistEntry
`id, eventId, userId, position, status (waitlisted|spot_offered|offer_accepted|offer_declined|
offer_expired|removed), offerExpiresAt?, createdAt`

## Announcement
`id, orgId, eventId?, authorId, title, body, delivery {sent, failed, audienceCount}, createdAt`

## Notification
`id, userId, kind (offer|reminder|announce|waitlist|receipt|transfer|refund|reschedule|cancel|
organizer_app), title, body, unread, deepLink, createdAt`

## OrganizerApplication
`id, userId, legalName, displayName, email, phone, orgName, city, description, expectedPlayers,
expectedGames, collectsMoney, verificationStatus (provider stub), status (player+admin enums),
adminNote?, decidedBy?, createdAt`

## AuditLogEntry
`id, scope (org|platform), orgId?, actorId, actorRole, action, targetType, targetId, reason?,
metadata, createdAt`

## Attendance
`eventId, userId, state (present|late|no_show), recordedBy, recordedAt`

## Reference data
Sports/categories, cities, venues, promo codes (future), platform fee config (future, disabled).

## Mock dataset coverage (must include)
≥3 orgs · multiple organizer roles/permissions · upcoming/full/cancelled/free/paid games ·
provisional + paid + waitlisted registrations · an active spot offer · a transfer request · a refund
request · announcements · an attendance list · an organizer application · a platform report · a
suspended organizer · a permission-restricted staff account. Realistic Canadian venues + CAD + dates.
No "Lorem ipsum"; all fictional.
