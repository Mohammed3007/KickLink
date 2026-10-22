# Auth Flow

Screens: Splash → Onboarding → Sign up / Sign in (+ Sign in with Apple) → Email verification →
Notification permission → Basic profile setup → (optional) profile completion → Home.
Also: Forgot password → Reset password. Terms & privacy acceptance at sign-up.

## Happy path (new player)
```
Splash (1.5s / tap)
  └─> Onboarding (3 value slides, "Skip")
        └─> Sign up
              ├─ email + password  ──┐
              └─ Sign in with Apple ─┤
                                     v
              Terms & privacy accept (checkbox, blocking)
                                     v
              Email verification (code) ── resend / change email
                                     v
              Notification permission (system prompt; "Not now" allowed)
                                     v
              Basic profile (name required; photo/position/skill optional)
                                     v
              [deep-link target if any] else Home
```

## Returning user
`Splash → Sign in → Home`. Apple sign-in returns directly if previously linked. Biometric unlock optional.

## Forgot / reset
`Sign in → Forgot password → enter email → "check your email" → Reset password (new + confirm) → Sign in`.

## Deep links (invite/event before auth)
Guest opens `kicklink.app/o/<orgId>` or `/e/<eventId>` → limited public view → "Sign up to join" →
after auth, resume to the org/game.

## States per screen
- **Sign up/in:** idle / validating / submitting / field-error / auth-error (wrong credentials) / rate-limited.
- **Email verification:** code-entry / wrong-code / expired-code (resend) / verified.
- **Notification permission:** prompt / granted / denied (later show in-app "enable in Settings" banner).
- **Profile setup:** required-incomplete (block continue) / saving / done.

## Rules
- Account required before any join/pay (guest is read-only).
- Password: min 8, 1 letter + 1 number (see VALIDATION_RULES).
- Apple sign-in must offer name capture if Apple hides email relay.
- Critical transactional notifications remain enabled regardless of marketing opt-out.
