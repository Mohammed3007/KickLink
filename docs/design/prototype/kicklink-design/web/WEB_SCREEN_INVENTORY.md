# Web Screen Inventory (Dashboards)

Two separate Next.js apps. Operational clarity over decorative analytics. Every list/table specifies
**loading (skeleton) · empty · filtered-empty · populated · row-selected** states, plus search, sort,
pagination, bulk actions, confirmation dialogs, success feedback, permission-denied, and
mobile-responsive (table → card) fallbacks. Status: delivered as responsive HTML mockups at the repo
root — `KickLink Organizer Dashboard.html` and `KickLink Platform Admin Dashboard.html`.

## Layout
Left **SidebarNav** (collapses to drawer < 1024) · top bar with org switcher (organizer) / global
search (admin) · content with FilterBar + DataTable + Pagination. Breakpoints in TOKENS.

## Organizer dashboard (`dashboard.kicklink.app`)
| Section | Screen(s) | Notes |
| --- | --- | --- |
| Overview | KPIs (ops-first: today's games, unpaid count, refund queue, pending transfers, collected) + action lists | not a chart wall |
| Calendar | month/week of games | click → event |
| Events | list + detail; create/edit; **recurring series** (edit one vs series) | guarded capacity/price edits |
| Registrations | table (player, reg status, pay status, amount, guest) | bulk: remind, remove, mark paid offline |
| Participant management | per-event roster | promote, comp, discount, remove |
| Waitlist | ordered, manual promote, skip-warning + reason | |
| Spot offers | active offers + countdowns | |
| Transfers | approve/reject, status | perm: manage players |
| Attendance | per-event check-in / no-show | mirrors mobile match-day |
| Announcements | compose + delivery status | |
| Players & members | directory; **pending membership requests**; remove/suspend | |
| Payments | transactions (gross/fee/net) | filters, export |
| Unpaid registrations | chase list | bulk remind/remove |
| Refund requests | review queue → approve/reject (reason) | perm: issue refunds |
| Payouts | pending/completed/blocked | perm: view financial reports |
| Financial reports / Exports | summaries + CSV export | |
| Promo codes | **future-ready** (visible, disabled) | |
| Organization profile | logo/cover, blurb, policies defaults | |
| Invitation links & IDs | generate/revoke; org ID | |
| Staff | members + roles | perm: manage staff |
| Roles & permissions | per-staff PermissionCheckbox grid | |
| Audit activity | AuditLogRow table | own-org scope |
| Settings | org settings | |
| Support | contact/help | |

### States to ship
loading/empty/filtered-empty/pagination/search/sort/confirm dialogs/success toasts/permission-denied/
mobile card fallback.

## Platform-admin dashboard (`admin.kicklink.app`)
| Section | Screen(s) | Notes |
| --- | --- | --- |
| Platform overview | health/ops queues (new applications, open disputes, failed refunds, support) | |
| Organizer applications | queue + **detail/verification** | approve/reject/request-info/suspend |
| Organizations | list + detail | suspend |
| Events | cross-org list | |
| Users | list + **detail** | suspend/ban, reliability |
| Payments / Refunds / Payouts | finance tables | override refunds |
| Disputes | queue | resolve |
| Reports | platform reports | |
| Reliability reviews | dispute/correction cases | |
| Support cases | tickets | |
| Suspensions & bans | active + history | |
| Sports & categories | reference data | |
| Cities & venues | reference data | |
| Platform settings | config | |
| Platform fees | **future-ready** (disabled) | |
| Administrator accounts | admins | |
| Roles & permissions | admin permission sets | |
| Audit logs | full platform scope | immutable |
| Analytics | platform analytics | |

### High-risk action pattern (admin)
Confirmation dialog + **written reason** + **impact explanation** + audit-log entry + permission gate.
Platform admins are never shown as organization organizers.

### Accessibility (web)
Keyboard-operable tables (sortable headers announce state), focus rings, skip-to-content, Esc closes
modals, screen-reader-friendly table semantics. See ACCESSIBILITY.
