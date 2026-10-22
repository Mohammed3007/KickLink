# Design Tokens

Single source of truth. The prototype defines these in `kl-kit.jsx` as the `KL` object; production
should expose them as a typed `tokens` module (RN) and CSS variables (web). **Never** hard-code raw
hex in screen files — reference semantic names.

## Color — raw palette

| Name | Value | Notes |
| --- | --- | --- |
| violet / violetPress | `#6E3BD8` / `#5A2BBF` | Brand accent (Club Violet) + pressed |
| violetTint / violetTint2 | `#F1ECFC` / `#E7DDFA` | Accent fills |
| ink / ink2 / ink3 | `#15131C` / `#5C5A66` / `#8E8C99` | Text primary / secondary / tertiary |
| bg | `#F2F1F6` | App background (grouped iOS) |
| card | `#FFFFFF` | Surface |
| fill | `#EFEFF4` | Neutral control fill |
| line / line2 | `rgba(60,60,67,.13)` / `rgba(60,60,67,.08)` | Separators (hairline) |
| green / greenBg | `#12915A` / `#E4F4EC` | Confirmed / paid |
| amber / amberBg | `#B7790E` / `#FBF0DC` | Provisional / payment due |
| blue / blueBg | `#2666D6` / `#E7F0FD` | Waitlist / info |
| orange / orangeBg | `#D85A18` / `#FCEADD` | Spot offered / transfer |
| red / redBg | `#CF3A40` / `#FBE9EA` | Cancelled / failed / destructive |
| gray / grayBg | `#6B6975` / `#ECECF0` | Refunded / neutral |

## Color — semantic tokens (use these)

```
backgroundPrimary    = bg            #F2F1F6
backgroundSecondary  = card          #FFFFFF
backgroundTertiary   = fill          #EFEFF4
textPrimary          = ink           #15131C
textSecondary        = ink2          #5C5A66
textTertiary         = ink3          #8E8C99
borderSubtle         = line          rgba(60,60,67,.13)
actionPrimary        = violet        #6E3BD8
actionPrimaryPressed = violetPress   #5A2BBF
actionDestructive    = red           #CF3A40
statusConfirmed      = green         #12915A   (on greenBg)
statusProvisional    = amber         #B7790E   (on amberBg)
statusPaymentDue     = amber         #B7790E
statusWaitlisted     = blue          #2666D6   (on blueBg)
statusOffered        = orange        #D85A18   (on orangeBg)
statusCancelled      = red           #CF3A40   (on redBg)
statusRefunded       = gray          #6B6975   (on grayBg)
statusInfo           = blue          #2666D6
statusWarning        = amber         #B7790E
statusError          = red           #CF3A40
statusNeutral        = gray          #6B6975
```
Contrast: all status foregrounds meet ≥ 4.5:1 on their paired `*Bg`; primary text on `bg`/`card`
exceeds 12:1. See `ACCESSIBILITY.md`.

## Typography
System font: **SF Pro / -apple-system** (web fallback `system-ui, sans-serif`).

| Role | Size / weight / tracking |
| --- | --- |
| Large title | 32 / 800 / -0.8 |
| Title (screen hero) | 26–27 / 800 / -0.6 |
| Section header (nav) | 16.5 / 600 / -0.3 |
| Card title | 16–17 / 700 / -0.4 |
| Body | 14.5–16 / 400–500 |
| Subhead / meta | 13–14 / 500–600 / color textTertiary |
| Caption | 11.5–12.5 / 500 |
| Section label (list) | 13–14 / 700, uppercase optional |
| Numeric (countdown, totals) | tabular-nums, 700–800 |

Support **Dynamic Type**: sizes above are the default; scale with the OS setting and never truncate
status or price text.

## Spacing — 4pt base
`2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 30`. Screen gutter = **16**. Card padding = **13–16**.
Inset list row padding = **12–16** horizontal, min height **50**.

## Corner radii
control 11–12 · card 18 · large CTA 15 · sheet 24 (top) · pill/avatar 999 · app icon 22.5% of size.

## Borders & shadows
- Hairline separators: `0.5px` `borderSubtle`, inset to align with row text.
- Card shadow: `0 1px 2px rgba(20,18,28,.05), 0 1px 10px rgba(20,18,28,.03)` — subtle only.
- Footer CTA bar: top hairline + `0 -6px 20px rgba(20,18,28,.04)`. **Avoid heavy/decorative shadows.**

## Icon sizes
inline 14–17 · row/meta 18–20 · tab bar 25 · hero 30–34. Stroke ~1.9 (2.1 active). SF Symbols on
device; the prototype's `KLIcon` set maps 1:1 to SF Symbol names in `COMPONENT_MAP.md`.

## Control heights & touch targets
CTA lg **52** · md **44** · sm **36** · toggle **31×51** · min hit target **44×44**.

## Tab bar
height ~**49** + safe-area inset (≈22). Blurred translucent background; active = violet icon+label,
inactive = `#9A98A4`. Badge = red pill, ≥16px.

## Animation durations
- Screen push/pop: **300ms** `cubic-bezier(.32,.72,0,1)`.
- Sheet present: **280–300ms** same curve.
- Toast drop: **300ms**. Success pop: **300–400ms** `cubic-bezier(.34,1.56,.64,1)`.
- **Entrance animations must animate transform only (never gate visibility on opacity)** so
  reduced-motion and first paint always show content. Respect `prefers-reduced-motion`.

## Breakpoints (web dashboards)
mobile `< 640` · tablet `640–1023` · desktop `1024–1439` · wide `≥ 1440`. Sidebar collapses to a
drawer below 1024; tables gain horizontal scroll / card fallback below 640.
