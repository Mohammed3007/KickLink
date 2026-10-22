# Accessibility

Target: **WCAG 2.1 AA**, native iOS accessibility, and keyboard-operable web dashboards.

## Colour & contrast
- Body/primary text ≥ 7:1; secondary/tertiary ≥ 4.5:1; status fg on status bg ≥ 4.5:1 (verified for
  all pairs in `TOKENS.md`).
- **Never colour-only.** Every status = icon + text + colour. Capacity uses a label ("3 left"/"Full")
  not just a coloured bar. Colour-blind safe: green/amber/blue/orange/red are also differentiated by
  icon shape (check / clock / swap / ball / x).

## Dynamic Type
- All text scales with the OS text-size setting. Layouts reflow (wrap, grow) — never clip price,
  status, countdown or deadline text. Test at XXL.
- Minimum font 11.5 default; nothing smaller even when dense.

## VoiceOver / screen reader
- Every actionable element has an accessible label. Icon-only buttons (share, back, add, WhatsApp,
  ellipsis) require explicit labels — listed in `COMPONENT_MAP.md`.
- Status badges announce the full state: "Registration: confirmed. Payment: paid."
- Countdown announces remaining time politely and warns at < 60s; don't spam per-second updates
  (use a live region with throttling).
- Grouped list rows announce as a group with header; tables expose row/column headers.
- Decorative elements (gradient hero stripes, avatars-as-decoration) are hidden from AT.

## Touch & focus
- Hit targets ≥ 44×44. Adjacent destructive and safe actions are separated.
- Visible focus ring on web (2px violet outline, 2px offset); logical tab order; skip-to-content link
  on dashboards; Esc closes sheets/modals; arrow keys move table selection.

## Motion
- Respect `prefers-reduced-motion`: disable slide/pop entrances, keep instant state changes.
- Entrance animations animate **transform only** so a frozen/disabled animation never hides content.
- No infinite decorative loops on content. The offer countdown's pulsing dot is paused under reduced motion.

## Forms & validation
- Labels are persistent (not placeholder-only). Errors are inline, specific, and announced; an error
  summary appears at the top of long/multi-step forms (event creation, organizer application).
- Required fields marked in text, not colour alone. Validation rules in `../handoff/VALIDATION_RULES.md`.

## Destructive & sensitive actions
- Two-step: action → confirmation sheet stating the impact; destructive confirm is the only full-red
  button. Reason field where the permission matrix requires it.

## Web tables
- Real `<table>` semantics with `<th scope>`; sortable headers announce sort state; bulk-select has a
  labelled "select all"; pagination is keyboard reachable and announces "page X of Y".

## Per-component a11y notes
Each entry in `COMPONENTS.md` must carry: accessible label source, role, focus behaviour, and AT
announcement. Build-time checklist: contrast audit, VoiceOver pass on core flows (join→pay, waitlist
→offer→accept, transfer), Dynamic Type XXL pass, reduced-motion pass, keyboard-only dashboard pass.
