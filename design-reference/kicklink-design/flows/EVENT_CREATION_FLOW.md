# Event (Game) Creation Flow

Multi-step with progressive disclosure + sensible defaults so the form never overwhelms. Available on
organizer mobile (quick) and web (full). Save as **Draft** at any step.

## Steps
```
1. Basics      type (pickup | training | tournament* | league*), title, format (5/6/7/11-a-side),
               skill level, age restrictions, description           (*placeholder/disabled in MVP)
2. Schedule    date, start time, arrival time, duration; one-time OR recurring series
               (frequency, day, end-after/until) — recurring → edit-one vs edit-series later
3. Venue       venue (from saved/cities-venues), address, map pin, directions note
4. Capacity    capacity, waitlist capacity, waitlist mode (manual | automatic),
               waitlist response deadline
5. Registration & payment
               model: free | pay-immediately | join-now-pay-later
               price, taxes/fees (future), payment deadline (pay-later),
               guest allowance (+max), invite-only toggle
6. Cancellation & refund policy
               full-before / partial-before / no-refund-after + deadline; organizer-review;
               refund-only-if-filled; transfer allowance + approval (manual/auto) + deadline
7. Player visibility
               full profile | first name + photo | display name only | participant count only | hidden
8. Communication
               auto-reminders on/off, WhatsApp group/event link, announcement on publish
9. Review & publish
               summary of all sections + validation summary → Publish (or keep Draft)
```

## Defaults (reduce friction)
pickup · 7-a-side · intermediate · capacity 14 / waitlist 6 · automatic waitlist · pay-immediately ·
full-refund-up-to-24h · transfers allowed (approval on) · visibility "first name + photo" ·
reminders on. Organizer can duplicate a previous game to skip most of this.

## Recurring edits
Editing an occurrence prompts **"This event only"** vs **"This and following / entire series"**.
Cancelling one occurrence auto-refunds that occurrence's registrants only.

## States
draft (autosave) · validating (per-step + review summary) · publishing · published · publish-error.
Capacity/price changes **after** publish trigger the guarded edit rules (see EDGE_CASES &
PERMISSION_MATRIX): reduce-capacity and price-change require confirmation + reason + notifications.

## Validation
Required per step enforced before advancing; review step shows an **error summary** linking to the
offending field. Rules in `../handoff/VALIDATION_RULES.md`.
