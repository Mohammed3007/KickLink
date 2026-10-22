# Permission Matrix

Two layers: **role** (Guest / Player / Organizer-staff / Org-owner / Platform-admin) and, within an
org, a **per-staff permission set**. Enforce **server-side**; the UI only hides what the server forbids.

## Global role capabilities

| Capability | Guest | Player | Organizer staff* | Org owner | Platform admin |
| --- | :-: | :-: | :-: | :-: | :-: |
| View invite/landing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create account / sign in | ✅ | — | — | — | — |
| Join org, register, pay | — | ✅ | ✅ | ✅ | ✅ |
| Waitlist / accept offer | — | ✅ | ✅ | ✅ | ✅ |
| Offer / transfer own spot | — | ✅ | ✅ | ✅ | ✅ |
| Apply to be organizer | — | ✅ | n/a | n/a | n/a |
| Run games (see below) | — | — | gated | ✅ | ✅ (oversight) |
| Approve organizer apps | — | — | — | — | ✅ |
| Suspend/ban accounts | — | — | — | — | ✅ |
| Override refunds / disputes | — | — | — | — | ✅ |
| Manage sports/cities/venues | — | — | — | — | ✅ |
| View audit logs | — | — | own org (if permitted) | own org | all |

*Organizer staff capabilities depend on the permission set below.

## Per-staff organizer permissions

| Permission | Manage events | Manage players | Manage payments | Issue refunds | Send announcements | View financial reports | Manage org settings | Manage staff | Record attendance |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Create/edit/cancel game | ✅ | | | | | | | | |
| Promote from waitlist | ✅ | ✅ | | | | | | | |
| Mark paid offline | | ✅ | ✅ | | | | | | |
| Add complimentary / discount | | ✅ | ✅ | | | | | | |
| Remove player | | ✅ | | | | | | | |
| Approve/reject transfer | | ✅ | | | | | | | |
| Refund (full/partial) | | | ✅ | ✅ | | | | | |
| View revenue/fees/payouts | | | | | | ✅ | | | |
| Export payment data | | | ✅ | | | ✅ | | | |
| Send announcement | | | | | ✅ | | | | |
| Edit org profile/settings | | | | | | | ✅ | | |
| Invite/approve/remove members | | ✅ | | | | | ✅ | | |
| Add/remove staff, set perms | | | | | | | | ✅ | |
| Check-in / no-show | | | | | | | | | ✅ |

### Rules
- **Org owner** implicitly has all permissions and is the only role that can transfer ownership.
- An **assistant organizer without `view financial reports`** must be blocked from revenue, payouts,
  exports and dispute detail — both in UI and API (see edge case "assistant accesses financials").
- Granting `manage staff` is itself a sensitive action → confirmation + audit entry.
- Platform admins act with **oversight** authority, not as a member of the org; their actions are
  attributed to the platform and always audit-logged.

## Sensitive actions requiring confirmation (+ reason where noted)

| Action | Confirm | Written reason | Audit |
| --- | :-: | :-: | :-: |
| Cancel game / occurrence | ✅ | optional | ✅ |
| Reduce capacity below filled | ✅ | ✅ | ✅ |
| Skip players in waitlist promotion | ✅ | ✅ | ✅ |
| Remove / suspend member | ✅ | ✅ | ✅ |
| Issue/override refund | ✅ | ✅ | ✅ |
| Change price after registrations | ✅ | ✅ | ✅ |
| Approve/reject organizer (admin) | ✅ | ✅ | ✅ |
| Suspend/ban account (admin) | ✅ | ✅ | ✅ |
| Grant platform-admin access | ✅ | ✅ | ✅ |
