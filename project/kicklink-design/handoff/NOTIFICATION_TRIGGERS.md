# Notification Triggers

Channels: **push** (APNs) + **in-app notification centre**. Critical transactional notifications stay
on regardless of marketing opt-out (where legally appropriate). Each maps to a deep link + a
notification `kind` (DATA_REQUIREMENTS → Notification).

| Trigger (server event) | kind | Audience | Push | Deep link | Copy pattern |
| --- | --- | --- | :-: | --- | --- |
| Registration confirmed / paid | receipt | player | ✅ | registration | "You're in — <game>. $N paid." |
| Payment due reminder (T-Xh) | reminder | provisional player | ✅ | registration | "Payment due in Xh — pay $N to keep your spot." |
| Payment failed | reminder | player | ✅ | checkout | "Payment didn't go through — your spot isn't secured." |
| Payment reconciled after outage | receipt | player | ✅ | registration | "Payment confirmed — you're all set." |
| Waitlist position changed | waitlist | waitlisted player | optional | waitlist | "You moved up to #k — <game>." |
| Spot available (offer) | offer | offered player | ✅ | spotOffer | "A spot opened up — <game>. Accept within mm:ss." |
| Spot-offer expiring soon | offer | offered player | ✅ | spotOffer | "Your spot offer expires in 2 min." |
| Offer expired / passed on | offer | player | ✅ | game | "That spot has passed to the next player." |
| Promoted & confirmed | offer | player | ✅ | registration | "You're confirmed — <game>." |
| Transfer: approval needed | transfer | organizer (perm: manage players) | ✅ | transfers | "Transfer request needs your approval." |
| Transfer: replacement paid / complete | transfer | both players | ✅ | registration | "Transfer complete — you're refunded $N." / "You're in." |
| Transfer: failed / expired | transfer | initiator | ✅ | transfer | "Transfer didn't complete — you keep your spot." |
| Refund status change | refund | player | ✅ | receipts | "Refund <status> — $N." |
| Event reminder (T-24h / T-2h) | reminder | confirmed players | ✅ | registration | "<game> tomorrow at 8:00 PM — Brewer Park." |
| Event cancelled | cancel | registrants + waitlist | ✅ | game | "<game> was cancelled. Refunds are on the way." |
| Event rescheduled | reschedule | registrants | ✅ | game | "<game> moved to <new>. Reconfirm or cancel." |
| New announcement | announce | org members / event registrants | ✅ (per prefs) | org/announcements | "<org>: <title>" |
| Membership approved | announce | applicant | ✅ | org | "You're in — <org>." |
| Organizer application status change | organizer_app | applicant | ✅ | organizerStatus | "Your organizer application is <status>." |
| Organizer: unpaid players / refund queue / pending transfer | reminder | organizer (perms) | optional | dashboard area | ops nudges |
| Admin: new organizer application / dispute / failed refund | — | platform admin | ✅ (web/email) | admin area | safety/finance queue |

## Rules
- **Idempotent**: duplicate webhooks/events never double-notify.
- **Throttle** countdown/position spam; one "expiring soon" max per offer.
- **Push disabled** → show in-app banner + Settings deep link; never silently drop a critical alert
  (it still lands in the notification centre).
- Preference granularity: critical (offers, waitlist, payment, transfer, refund — locked on),
  helpful (reminders, announcements — toggle), optional (product/marketing — off by default).
- Notification centre supports read/unread + filters by kind.
