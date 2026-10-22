# Player Screen Inventory (Mobile)

Legend: **✅ built** in prototype · **◑ partial** (state variants to add) · **▢ spec** (designed in docs,
not yet in prototype). Route + proto symbol in `../handoff/ROUTE_MAP.md`. Each screen follows the
`DEVELOPER_HANDOFF.md` contract.

## Auth & onboarding
| Screen | Status | Key states |
| --- | --- | --- |
| Splash | ✅ | timed / tap-to-skip |
| Onboarding (value slides) | ▢ | 3 slides / skip |
| Sign up | ▢ | idle/validating/submitting/error |
| Sign in (+ Sign in with Apple) | ▢ | idle/error/rate-limited |
| Email verification | ▢ | code/wrong/expired/verified |
| Forgot password / Reset password | ▢ | sent / new+confirm / error |
| Notification permission | ▢ | prompt/granted/denied |
| Basic profile setup | ▢ | required-incomplete/saving/done |
| Optional profile completion | ▢ | skip/save |
| Terms & privacy acceptance | ▢ | blocking checkbox |

## Home
| Screen | Status | States |
| --- | --- | --- |
| Home (urgent → next → payment due → waitlist/offer → upcoming → announcements → orgs) | ✅ | default ✅ · payment-due ✅ · spot-offer ✅ · waitlisted ✅ · multi-urgent ◑ · no-games ▢ · loading ▢ · offline ▢ · error ▢ |

## Organizations
| Screen | Status |
| --- | --- |
| Organization list | ✅ · empty ▢ |
| Join with organization ID | ✅ · invalid-ID ▢ |
| Join via invitation link | ◑ (link paste → org) · expired ▢ · revoked ▢ |
| Membership pending / approved | ▢ |
| Organization detail | ✅ |
| Organization game list | ✅ (in detail) |
| Organization announcements | ✅ |
| Organization members (per privacy) | ◑ (participants screen) |
| Leave organization | ▢ |
| Removed / suspended membership state | ▢ |

## Games
| Screen | Status |
| --- | --- |
| Upcoming / Past / Open (segmented) | ✅ |
| Search & filter | ▢ |
| Game details | ✅ · full ✅ · registration-closed ◑ · cancelled ◑ · rescheduled ▢ |
| Participant list (+ hidden variant) | ✅ · hidden ▢ |
| Venue & directions / Add to calendar / WhatsApp / organizer contact | ✅ |
| Event rules / refund policy / equipment | ✅ |

## Registration
| Screen | Status |
| --- | --- |
| Join review (pay-now / pay-later / free) | ✅ |
| Guest registration (+ multiple) | ◑ (single guest toggle) |
| Checkout → success (confirmed) | ✅ |
| Provisional registration + deadline | ✅ |
| Duplicate-registration warning | ▢ |
| Capacity lost during checkout | ▢ |
| Registration details | ✅ |
| Cancel registration + policy confirm | ✅ |
| Refund request + status | ◑ (cancel→refund; dedicated request screen ▢) |
| Past registration receipt | ✅ (receipts) |

## Payments
| Screen | Status |
| --- | --- |
| Method selection / Apple Pay / card | ✅ |
| Processing / success / failure | ✅ processing+success · failure ▢ |
| Additional verification required | ▢ |
| Connection lost after payment / reconciliation | ▢ |
| Payment history / receipt detail | ✅ |
| Refund status / partial / failed / disputed | ◑ |

## Waitlist
| Screen | Status |
| --- | --- |
| Join waitlist / confirmation | ✅ |
| Waitlist position / position changed | ✅ |
| Spot offer + countdown | ✅ |
| Accept / decline / expired | ✅ (accept→checkout, decline, expired) |
| Promoted & confirmed | ✅ (via success) |
| Removed from waitlist / game cancelled while waitlisted | ▢ |

## Spot offering & transfer
| Screen | Status |
| --- | --- |
| Offer my spot (refund clarity) | ✅ |
| Offer to waitlist / specific player (member search) | ✅ search ◑ |
| Organizer approval required | ✅ (in flow) |
| Transfer pending / status timeline | ✅ |
| Transfer complete / failed / expired / cancel | ◑ (complete+cancel; failed/expired ▢) |

## Notifications
| Screen | Status |
| --- | --- |
| Notification centre (read/unread) | ✅ |
| Filters | ▢ |
| Per-kind rows (announce/payment/waitlist/offer/transfer/refund/cancel/reschedule/organizer) | ◑ (5 kinds built) |
| Notification preferences | ✅ |
| Push-disabled state | ▢ |

## Profile & support
| Screen | Status |
| --- | --- |
| Profile | ✅ |
| Edit profile | ▢ |
| Privacy settings | ✅ |
| Notification settings | ✅ |
| Payment history / Game history | ✅ |
| Reliability dispute / attendance correction | ▢ |
| Help centre / contact support | ▢ |
| Report user / org / event | ▢ |
| Account deletion / data export | ◑ (privacy screen entries) |
| Sign out | ✅ (entry) |

## Organizer entry (from player)
| Screen | Status |
| --- | --- |
| Apply to become organizer | ✅ |
| Organizer application status | ✅ |

**Built count:** ~30 screens functional in the prototype covering the player core. Remaining ▢/◑ are
specified here + in flows and are the next mobile build pass.
