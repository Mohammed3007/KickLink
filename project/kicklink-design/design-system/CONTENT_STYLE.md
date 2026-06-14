# Content & Terminology Style

## Canonical terms (never drift)
| Use | Not |
| --- | --- |
| game | match, session, fixture (fixture is league/Phase 3 only) |
| organization / organizer | club, admin (for org staff) |
| player | member (except "organization members" when listing membership), user (UI copy) |
| registration | booking, signup (for game joins) |
| confirmed spot | guaranteed/secured booking |
| waitlist · spot offer · spot transfer | queue · invite · swap |
| payment deadline | due date (ok as short label "Due") |
| refund request | refund ticket |
| announcement | broadcast, message |
| attendance · no-show | present/absent |
| platform admin | super admin, staff |

"Event" is allowed **internally / in code** as the broad entity; **UI always says "game"** for pickup.

## Voice
Plain, confident, friendly-but-trustworthy. Short. Second person ("You're confirmed"). Money and
status are always explicit and never euphemised.

## Microcopy patterns
- Status-first: "Spot confirmed", "Payment due in 36h", "You're #3 on the waitlist".
- CTAs are verbs with the stake: "Join · $12.00", "Accept & pay $9.00", "Cancel & refund $12.00",
  "Pay now". Avoid bare "Submit/OK/Continue" when an amount or consequence is known.
- Always show the **cancellation policy before payment**.
- Distinguish provisional vs confirmed in words: "Provisional spot — pay within 36h to keep it."
- Offers state the stake + deadline: "A spot is yours — for now. Accept within 9:00."
- Transfers reassure: "Your spot is safe until it's filled."

## Numbers, dates, money
- Currency: `$12.00 CAD`. Always 2 decimals on totals.
- Dates: `Sun, Jun 14` (short, weekday + month + day); time `8:00 PM`; render in **venue local time**
  with tz label where ambiguous.
- Counts: "3 left", "11 of 14 spots filled", "#3 on the waitlist".

## Errors & empties
- Errors say what happened + what to do: "This spot was just taken — join the waitlist?" not "Error 409".
- Empty states are encouraging + actionable: "No upcoming games — join an open game in one of your clubs."
- Permission denied names the gap + who to ask: "You don't have permission to view financials. Ask
  your organization owner."

## Notifications copy
Lead with the actionable noun + game: "A spot opened up — Tuesday Indoor 5s". Reminders include the
amount and window: "Payment due in 36h — pay $15.00 to keep your spot." Keep under ~120 chars for push.

## Accessibility-of-copy
- Don't rely on emoji or colour words ("the green one"). Icon-only controls get text labels.
- Spell out abbreviations on first use; keep `CAD`, `min`, `5-a-side` (hyphenated, lowercase a-side).
