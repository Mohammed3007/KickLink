# Product Overview

## The problem

Pickup-soccer organizers in Canada run games through WhatsApp + Interac e-Transfer. That means:
manual name lists, separate money transfers, chasing unpaid players, manual replacement-finding
when someone drops, and players who can't tell whether they're confirmed, waitlisted or owe money.

## The product

KickLink is a **private, organization-based** system. Players don't discover games on a public map;
they join an **organization** (club) via invite link or ID, then see and join that org's **games**.
Everything a WhatsApp thread does badly — confirmed/paid/waitlist status, payment collection,
spot offers, replacements, announcements, attendance — becomes a first-class, server-authoritative
feature.

## What a player always knows

What game they joined · whether their spot is **confirmed** vs **provisional** · whether they've
**paid** and how much they owe · where/when the game is and who organizes it · their **waitlist
position** · when a spot opens and the **deadline to claim it** · whether they can **offer/transfer**
their spot.

## What an organizer always knows

Spots filled · who's paid / unpaid / waitlisted / cancelled · who's offering a spot · money
collected · pending refunds · players needing approval · whether an announcement was delivered.

## Core concepts & terminology (use these exact terms)

| Term | Meaning |
| --- | --- |
| **Organization** | A private club. Has members, an ID (e.g. `WSL-4471`), invite links, staff. |
| **Organizer** | An approved member who runs games for an org. Permission-based. |
| **Player** | An end user who joins orgs and registers for games. |
| **Game** | The user-facing pickup session. (Internally "event" is the broader technical entity.) |
| **Registration** | A player's record against a game. Has a **registration status** and a **payment status** (separate). |
| **Confirmed spot** | A registration that holds a guaranteed place. |
| **Waitlist** | Ordered queue for a full game. |
| **Spot offer** | A time-boxed offer of a freed place to a waitlisted/eligible player. |
| **Spot transfer** | A confirmed player passing their place to a replacement (org-approved or automatic). |
| **Payment deadline** | The cutoff for join-now-pay-later registrations. |
| **Refund request** | A player-initiated refund, subject to the event policy. |
| **Announcement** | A push + in-app message from an organizer to an org/event. |
| **Attendance / No-show** | Match-day records the organizer sets. |

> Consistency rules: always "game" (not match), "organization/organizer" (not club/admin in UI
> copy), "registration" (not booking), "player" (not member, except "org members" when listing
> membership). See `design-system/CONTENT_STYLE.md`.

## Platform shape

- **Initial market:** Canada · CAD · iOS-first.
- **Mobile:** Expo React Native — players + organizer match-day ops.
- **Web:** Next.js organizer dashboard (heavy ops/finance) and Next.js platform-admin dashboard.
- **Private by default.** Public discovery / maps are explicitly **Phase 2**.

## Why two web dashboards + a mobile organizer mode

Organizers do *fast, physical* work at the field (check-in, walk-ins, last-minute announcements) →
**mobile organizer workspace**. They also do *heavy, seated* work (refunds, payouts, exports,
recurring series, staff) → **web dashboard**. Platform admins do *trust & safety + finance across
all orgs* → a **separate** admin dashboard, never conflated with an organizer account.
