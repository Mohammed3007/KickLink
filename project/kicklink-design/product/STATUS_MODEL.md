# Status Model

**Four independent status dimensions.** Never merge them into one badge. A registration can be
`Confirmed` (registration) + `Refunded` (payment) + `Completed` (refund) simultaneously.

Each status maps to a **semantic token** (see `design-system/TOKENS.md`) and a **shape/icon** so it
never relies on colour alone.

---

## 1. Event status
`draft · published · almost_full · full · registration_closed · cancelled · completed`

| Status | Token | Icon | Meaning / transition |
| --- | --- | --- | --- |
| `draft` | statusNeutral | pencil | Not visible to players. → `published` |
| `published` | statusInfo | check | Live, accepting registrations |
| `almost_full` | statusWarning | gauge | Derived: spotsLeft ≤ threshold (default 3) |
| `full` | statusWaitlisted | users | filled ≥ capacity; waitlist active |
| `registration_closed` | statusNeutral | lock | Past cutoff or manually closed |
| `cancelled` | statusCancelled | x | Organizer cancelled; refunds auto-initiated |
| `completed` | statusNeutral | flag | Kickoff passed; attendance finalized |

## 2. Registration status
`pending · provisional · confirmed · waitlisted · spot_offered · transfer_pending · cancelled · attended · no_show`

| Status | Token | Icon | Meaning |
| --- | --- | --- | --- |
| `pending` | statusNeutral | clock | Transient: registration created, awaiting payment session result |
| `provisional` | statusWarning | clock | Join-now-pay-later spot held; has payment deadline |
| `confirmed` | statusConfirmed | check-circle | Guaranteed place |
| `waitlisted` | statusWaitlisted | swap | In ordered queue; carries `waitlistPosition` |
| `spot_offered` | statusOffered | ball | Offer extended; carries `offerExpiresAt` |
| `transfer_pending` | statusOffered | swap | Player offered their spot; still holds it until replacement pays |
| `cancelled` | statusCancelled | x | No longer registered |
| `attended` | statusConfirmed | check | Match-day check-in |
| `no_show` | statusCancelled | x | Did not attend |

## 3. Payment status
`not_required · unpaid · payment_due · processing · paid · failed · partially_refunded · refunded · disputed`

| Status | Token | Icon | Meaning |
| --- | --- | --- | --- |
| `not_required` | statusConfirmed | — | Free game |
| `unpaid` | statusWarning | clock | Owed, no deadline pressure yet |
| `payment_due` | statusWarning | clock | Pay-later with an active/near deadline |
| `processing` | statusNeutral | spinner | Provider session in progress / webhook pending |
| `paid` | statusConfirmed | check | Server-confirmed payment |
| `failed` | statusError | alert | Charge failed; spot not secured |
| `partially_refunded` | statusNeutral | minus | Partial refund completed |
| `refunded` | statusNeutral | minus | Full refund completed |
| `disputed` | statusError | alert | Chargeback/dispute open |

## 4. Refund status
`not_requested · requested · under_review · approved · rejected · processing · completed · failed`

| Status | Token | Icon |
| --- | --- | --- |
| `not_requested` | — | — |
| `requested` | statusInfo | clock |
| `under_review` | statusWarning | eye |
| `approved` | statusConfirmed | check |
| `rejected` | statusError | x |
| `processing` | statusNeutral | spinner |
| `completed` | statusConfirmed | check |
| `failed` | statusError | alert |

## 5. Organizer-application status
Player view: `not_started · draft · submitted · under_review · more_info_requested · approved · rejected · suspended`
Admin view: `new · under_review · verification_pending · more_info_requested · approved · rejected · suspended`

## 6. Internal reliability (private — never a public number)
Indicator only: `new_participant · good_standing · attendance_concern · payment_concern · review_recommended`
Derived from games attended, late cancels, no-shows, missed payment deadlines, repeated failed
offers, completed registrations, organizer adjustments, disputed attendance. Includes a
**dispute/correction** path so organizers can't unfairly damage an account.

---

## Display rules
- Registration + payment shown as **two separate badges** (e.g. `Confirmed` · `Paid`).
- The most urgent dimension drives the home **urgent-action card** (payment_due > spot_offered > reschedule-confirm).
- Badges always pair **icon + text**; colour is reinforcement, not the signal.
- Status strings are an enum — no free-text statuses anywhere (see `VALIDATION_RULES.md`).
