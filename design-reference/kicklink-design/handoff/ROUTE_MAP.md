# Route Map

Mobile routes are logical (stack/tab) names; web routes are URL paths. Prototype `Screen*` symbols in
parentheses.

## Mobile — Player (tabs)
| Tab | Route | Screen (proto) |
| --- | --- | --- |
| — | `/splash` | KLSplash |
| — | `/onboarding` | *(spec)* |
| — | `/auth/sign-up`, `/auth/sign-in`, `/auth/verify`, `/auth/forgot`, `/auth/reset` | *(spec)* |
| — | `/onboarding/notifications`, `/onboarding/profile` | *(spec)* |
| Home | `/home` | ScreenHome |
| Games | `/games` | ScreenGames |
| | `/games/:gameId` | ScreenGameDetails |
| | `/games/:gameId/participants` | ScreenParticipants |
| | `/games/:gameId/join` | ScreenJoinReview |
| | `/games/:gameId/checkout` | ScreenCheckout |
| | `/games/:gameId/success` | ScreenSuccess |
| | `/games/:gameId/registration` | ScreenReg |
| | `/games/:gameId/cancel` | ScreenCancelReg |
| | `/games/:gameId/waitlist/join` | ScreenWaitConfirm |
| | `/games/:gameId/waitlist` | ScreenWaitPos |
| | `/games/:gameId/offer` | ScreenSpotOffer |
| | `/games/:gameId/offer-spot` | ScreenOfferSpot |
| | `/games/:gameId/transfer` | ScreenTransferStatus |
| | `/games/:gameId/share` | ScreenShareEvent |
| Organizations | `/orgs` | ScreenOrgs |
| | `/orgs/join` | ScreenJoinOrg |
| | `/orgs/:orgId` | ScreenOrgDetail |
| | `/orgs/:orgId/announcements` | ScreenAnnouncements |
| Notifications | `/notifications` | ScreenNotifs |
| Profile | `/profile` | ScreenProfile |
| | `/profile/receipts` | ScreenReceipts |
| | `/profile/notifications` | ScreenNotifPrefs |
| | `/profile/privacy` | ScreenPrivacy |
| | `/profile/organizer/apply` | ScreenOrganizerApply |
| | `/profile/organizer/status` | ScreenOrganizerStatus |

## Mobile — Organizer workspace (switcher)
`/o` overview · `/o/today` · `/o/games`, `/o/games/new`, `/o/games/:id/edit`,
`/o/games/:id/duplicate`, `/o/games/:id/participants`, `/o/games/:id/waitlist`,
`/o/games/:id/check-in`, `/o/games/:id/announce` · `/o/refunds` · `/o/transfers` ·
`/o/members`, `/o/members/requests` · `/o/staff` · `/o/settings` · `/o/switch-org`.

## Web — Organizer dashboard (`dashboard.kicklink.app`)
`/` overview · `/calendar` · `/events`, `/events/new`, `/events/:id`, `/events/:id/edit`,
`/events/recurring/:seriesId` · `/registrations` · `/registrations/:id` · `/waitlists` ·
`/offers` · `/transfers` · `/attendance` · `/announcements` · `/members`, `/members/requests` ·
`/payments` · `/payments/unpaid` · `/refunds` · `/payouts` · `/reports`, `/exports` ·
`/promo-codes` *(future-ready)* · `/organization` · `/invites` · `/staff` · `/roles` ·
`/audit` · `/settings` · `/support`.

## Web — Platform admin (`admin.kicklink.app`)
`/` overview · `/applications`, `/applications/:id` · `/organizations`, `/organizations/:id` ·
`/events` · `/users`, `/users/:id` · `/payments` · `/refunds` · `/payouts` · `/disputes` ·
`/reports` · `/reliability` · `/support` · `/suspensions` · `/sports` · `/venues` ·
`/settings` · `/settings/fees` *(future-ready/disabled)* · `/admins` · `/roles` · `/audit` · `/analytics`.

## Deep links
`kicklink.app/o/:orgId` (join org) · `kicklink.app/e/:eventId` (game) · `kicklink.app/i/:inviteToken`
(invite). Pre-auth → limited public view → resume after sign-up.
