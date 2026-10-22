# User Roles

Roles are **contextual**: a single account can be a Player globally and an Organizer *within
specific organizations*, and (rarely) a Platform Admin. The app uses a **workspace switcher** to
make the active role explicit and to prevent accidental organizer actions from a player context.

## A. Guest (unauthenticated)
- Open an invite link or enter an org/event ID
- View limited public info + value prop
- Sign up / sign in
- **Must create an account before joining or paying.**

## B. Player (authenticated, default)
- Profile (name; optional photo, position, skill)
- Join orgs via link/ID; browse games in joined orgs
- Register (self + guest where allowed); pay now or pay-later or free
- View registration status, payment status, receipts, history
- Join waitlist; view position; receive position/offer notifications; accept/decline within limit
- Cancel registration; request refund
- Offer/transfer a confirmed spot (org rules apply)
- Add to Apple Calendar; open Maps; open org/event WhatsApp
- Manage notification preferences (critical transactional stay on)
- Privacy/visibility controls; report org/event/user; data export; account deletion
- **No public ratings.** A private reliability record exists (attendance, late cancels, no-shows,
  missed payments) visible only to organizers/admins.

## C. Organizer applicant
- Any player can apply. Collects: legal name, display name, email, phone, organization name, city,
  description, expected players, expected games, whether they collect money, **verification
  placeholder**, organizer-agreement acceptance.
- Player-side states: **Not started · Draft · Submitted · Under review · More info requested ·
  Approved · Rejected · Suspended.**
- Payout details are collected **after** initial approval (via provider), never raw bank data in-app.

## D. Organizer (approved)
Scoped to organizations they own or are staff in. Capabilities (gated by permissions):
- Create/edit/duplicate/cancel/reschedule games; one-time + recurring (edit one vs series)
- Configure model, price, taxes/fees (future), capacity, waitlist capacity & mode, deadlines,
  venue, schedule, format, skill, age, rules, equipment, policies, guest/transfer allowances, visibility
- Manage participants: view confirmed/unpaid/cancelled/waitlisted; promote from waitlist (with
  skip-warning + reason for audit); mark paid offline; add complimentary; apply discount/promo;
  remove player
- Refunds (full/partial where permitted); review refund requests; approve/reject transfers
- Record attendance & no-shows
- Send announcements; share via WhatsApp; copy links/IDs
- View event revenue, fees, refunds; export participant/payment data; basic analytics
- Manage org: logo/cover, invite links, org ID, member approvals, remove/suspend members,
  assistant organizers + **permission control**, org settings
- The **org owner** can grant limited or full organizer access to others.

Permission set (per staff member): manage events · manage players · manage payments · issue refunds ·
send announcements · view financial reports · manage organization settings · manage staff · record attendance.

## E. Platform administrator
Operates across all orgs; **never** modeled as an organization organizer.
- Review organizer applications; request info; approve/reject/suspend
- Review all orgs, events, users, reports, disputes
- Override refunds where appropriate; suspend/ban accounts
- Manage admin permissions; configure platform settings & (future) fees
- View transactions, refunds, payout status
- Manage supported sports, cities, venues, promo codes
- View audit logs; review internal reliability; platform analytics; support tools
- Admin-side application states: **New · Under review · Verification pending · More info requested ·
  Approved · Rejected · Suspended.**
- **All high-risk actions:** confirmation + written reason + impact explanation + audit entry + permission gate.

## Workspace model

- **Player workspace** (default tab bar: Home · Games · Organizations · Notifications · Profile).
- **Organizer workspace** (separate home, org switcher, match-day tools). Entered via the workspace
  switcher; persistent visual indicator (e.g. tinted nav + "Organizer" label) while active.
- **Admin** lives on web only.
- Switching workspace never performs an action; sensitive organizer actions require confirmation.
