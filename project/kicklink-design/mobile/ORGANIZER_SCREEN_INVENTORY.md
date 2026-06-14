# Organizer Screen Inventory (Mobile Workspace)

The organizer **mobile** workspace optimizes **fast, match-day** tasks; heavy finance/admin lives on
web (see `../web/WEB_SCREEN_INVENTORY.md`). Entered via the workspace switcher with a persistent
"Organizer" indicator and org switcher. Status: ▢ spec — the organizer operational surface is
delivered at full fidelity as the **web dashboard** (`KickLink Organizer Dashboard.html`); this
inventory specifies the condensed mobile match-day version.

## Workspace shell
| Screen | Notes |
| --- | --- |
| Workspace switcher | Player ⇄ Organizer; org picker; confirms sensitive entry |
| Organizer home / overview | today's games, urgent actions (unpaid, refund requests, pending transfers, waitlist offers), money snapshot |
| Switch organization | multi-org list |

## Match-day (the priority)
| Screen | Primary actions |
| --- | --- |
| Today's games | open a game fast |
| Check-in | search player, tap to mark present, mark **late**, big touch targets, live filled count |
| Mark no-show | from check-in list |
| Add walk-in / offline-paid player | quick add (+ mark paid offline), audit-logged |
| Send announcement | last-minute push to event/org |

## Game management
| Screen | States/actions |
| --- | --- |
| Create game | the 9-step flow (EVENT_CREATION_FLOW), mobile-condensed |
| Edit game | edit-one vs edit-series for recurring; guarded capacity/price edits |
| Duplicate game | prefill from previous |
| Cancel / reschedule game | confirmation + reason; auto-refund/notify |
| Create recurring series | frequency, day, end |
| Participant list | confirmed/unpaid/cancelled/waitlisted filters |
| Add complimentary / apply discount | audit-logged |
| Remove player | confirm + reason |
| Waitlist management / manual promotion | reorder/select; skip-warning + reason |
| Mark paid offline | reconciles payment status |

## Ops
| Screen | Notes |
| --- | --- |
| Unpaid players | nudge/remove |
| Pending refund requests | approve/reject (perm: issue refunds) |
| Pending transfers | approve/reject (perm: manage players) |
| Waitlist offers | see active offers/countdowns |
| Basic financial summary | revenue, fees, refunds (perm: view financial reports) |

## Organization
| Screen | Notes |
| --- | --- |
| Organization settings | profile, logo/cover, policies defaults |
| Invite link & organization ID | copy/share/regenerate/revoke |
| Member approval | pending requests queue |
| Staff list | members with roles |
| Permission overview | per-staff permission set (read; edit on web) |

## Permission & state behaviour
- Every screen respects the per-staff permission set; restricted areas show a **permission-denied**
  state (not a blank), and the attempt is audit-logged.
- Loading (skeleton), empty, and offline (mutations disabled) states required throughout.
- Sensitive actions (cancel, reduce capacity, refund, remove member, change price) require
  confirmation + reason where the permission matrix mandates it.
