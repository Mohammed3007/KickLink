# Roadmap

## MVP (build first) — see `MVP_SCOPE.md`
Auth + Apple sign-in · basic profile · organizer application & platform approval · private orgs ·
invites + IDs · one-time & recurring games · free / pay-now / pay-later · capacity · waitlists
(manual + optional auto) · spot offering · basic transfers · push + announcements · attendance ·
internal reliability indicators · organizer web dashboard · platform-admin dashboard · permissions ·
audit logs · payment history/receipts · refunds.

## Phase 2 — growth & convenience
- Public game discovery, search by city, **map view**
- Account credits; **promo codes** (UI is present but disabled/future-ready in MVP)
- Organizer subscriptions; **platform transaction fees** (status model & payout already account for fees)
- Advanced analytics; enhanced **transfer marketplace**
- Player favourites; **venue management**; multi-sport support
- **Team registration**; tournament registration

## Phase 3 — league management
Leagues, seasons, divisions, teams, captains, rosters, player + team fees, **installment payments**,
fixtures, venue scheduling, results, standings, player statistics, cards & suspensions, referee
assignments, playoffs, tournament brackets, league announcements, team communication integrations.

## Architecture guardrails so later phases don't force a rewrite
- **"Event" is the broad entity; "game" is the pickup specialization.** Model `event.type ∈
  {pickup, training, tournament, league}` from day one; only `pickup`/`training`/recurring are active.
- **Org → Event → Registration** hierarchy generalizes to League → Season → Fixture → TeamRegistration.
- **Money is fee-aware now:** payment records carry `gross`, `fee`, `net`, `currency` even while fee
  is 0, so platform fees/payouts/subscriptions slot in without migration.
- **Feature flags** (`features.publicDiscovery`, `features.promoCodes`, `features.leagues`, …) gate
  unreleased UI; navigation never dead-ends — show "Coming soon" affordances.
- **Roles & permissions are data**, not hard-coded, so league roles (captain, referee) extend the set.
- **Status enums are versioned**; never reuse a string for a new meaning.
