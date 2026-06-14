# Organizer Application & Approval Flow

A player applies; a **platform admin** approves before organizer tools unlock. No insecure document
upload — identity/business verification is a **placeholder** for a trusted KYC provider.

## Player side
```
Profile → "Run your own games / Become an organizer"
   → Application form (multi-section, saveable as Draft)
       Legal name · Display name · Email · Phone · Organization name · City · Description
       · Expected players · Expected games · "Do you collect money?" · Verification placeholder
       · Accept organizer agreement
   → Submit → Application status: Under review
```
Player-side states: **not_started · draft · submitted · under_review · more_info_requested ·
approved · rejected · suspended.**

Status screen shows a timeline: Submitted → Under review → Identity & payout setup (after approval)
→ Organizer tools unlocked. Push + notification-centre entry on every status change.

- **more_info_requested** → form reopens with admin's note + the specific fields/questions to address.
- **approved** → prompt to set up **payout** (provider-hosted) + create first organization/game.
- **rejected** → reason shown; re-apply allowed after a cool-down (configurable).
- **suspended** → organizer tools locked; existing events read-only; contact support.

## Platform-admin side
```
Admin → Organizer applications queue (filter by status)
   → Application detail: applicant profile, org info, description, expectations, reliability,
     verification status (provider), prior orgs
   → Actions (each: confirm + written reason + audit entry):
       Request more info  → notifies player, sets more_info_requested
       Approve            → verification_pending → on provider clear → approved; payout setup unlocked
       Reject             → reason → notifies player
       Suspend            → reason → locks tools, events read-only
```
Admin-side states: **new · under_review · verification_pending · more_info_requested · approved ·
rejected · suspended.**

## Rules
- Payout/bank details collected **after** initial approval, via provider — never raw in-app.
- Approve/reject/suspend are high-risk: confirmation + reason + audit log + permission gate.
- Verification provider integration is stubbed; UI clearly labels "verified by <provider>".
