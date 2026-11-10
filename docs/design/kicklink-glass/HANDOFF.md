# KickLink Glass: landing + login redesign handoff

> For Claude Code (or any coding agent) working in `Mohammed3007/KickLink`.
> Put this folder at `docs/design/kicklink-glass/` in the repo.

## 1. What to build

Rebuild two existing pages in the Next.js app (`web/`) to match the approved design:

| Page | Route / files today | Design reference |
|---|---|---|
| Marketing landing | `web/app/(marketing)/page.tsx`, `layout.tsx`, `components/marketing/site-header.tsx`, `hero-preview.tsx` | `reference/Main.dc.html` |
| Log in | `web/app/(auth)/login/page.tsx`, `login-form.tsx`, `components/auth/auth-shell.tsx`, `auth-ui.tsx`, `google-button.tsx` | `reference/Login.dc.html` |

The look is "KickLink Glass": a dark, premium liquid-glass system. Frosted panels float over a near-black background lit by slow-drifting gold and pitch-green glows, with springy, physical motion. It keeps the repo's existing **Onyx & Gold** palette and adds **pitch green** as the third colour.

**Recreate the visual output and motion, not the prototype's internal structure.** Build it the way this codebase already works: React Server Components plus client components, Tailwind v4 tokens in `globals.css`, and `motion/react` (already a dependency, `motion@^12`).

### Before writing code
1. Read `web/AGENTS.md`. This Next.js version (16.x) has breaking changes, so check `node_modules/next/dist/docs/` for anything you're unsure about.
2. Read both reference files top to bottom (format notes in section 9).
3. Ask the user before changing anything outside the scope above, e.g. the in-app (`(app)`) screens or the signup, forgot and reset pages.

## 2. Hard rules

- **Do not change auth behaviour.** Keep `authenticate` / `resendVerification` server actions, `useActionState`, `useFormStatus` pending state, the `returnTo` hidden input and `safeReturnPath`, the `isGoogleEnabled()` flag around the Google button + divider, the `needsVerification` resend flow, the `/forgot` and `/signup` links, and `metadata`. The design's fake 1.3 s "You are in." success state is prototype-only. Real login redirects as it does today; you may show the green tick briefly only if it doesn't delay the redirect.
- **Keep analytics attributes** on CTAs (`data-analytics-event="marketing.signup_cta_click"`, etc.).
- **No invented facts.** Bracketed placeholders stay as visible placeholders for the user to fill: `[PRICE]`, `[FEE]`, `[TIME]`, `[DATE]`, `[ORGANIZER QUOTE …]`, `[NAME] · [ROLE], [CLUB]`, `[CLUB NAME]`, `[PLAYER]`, `[ORGANIZER]`, `[FIELD]`, `[RESPONSE TIME]`. The live site's stats strip ("3 clubs / 140+ players / 98% / <10s") was intentionally dropped. Don't re-add it unless the user confirms the numbers are real.
- **Content must be readable with JS off.** Server-render final states and let JS/motion only set *starting* states.
- **`prefers-reduced-motion`:** show final states with no motion (use `useReducedMotion()`; the existing `Reveal` already follows this pattern).
- **Never set `opacity` or `filter` on an element with `transform-style: preserve-3d`**: it flattens the 3D scene. Fade the leaf elements (heads, stems, labels) instead.
- **Accessibility:** real `<a>`, `<button>`, `<label>`+`<input>`. Decorative 3D scenes get `role="img"` + an `aria-label` describing them (copy the labels from the reference). Split-letter headlines keep an `aria-label` on the heading and `aria-hidden` on the letters. Text contrast ≥ 4.5:1. Touch targets ≥ 44 px.
- Don't import the Motion UMD build the prototype loads from `/_blob/…`; use the npm package.

## 3. Design tokens

Add to `web/app/globals.css` (Tailwind v4 `@theme`). Several already exist: reuse `--color-field-950`, `--color-gold-*`, `--color-grass-500`.

```css
/* colours */
--color-ink: #08080A;            /* bg/base (exists as field-950/canvas) */
--color-deep: #0B1A14;           /* bg/deep: pitch-night, used inside big glows */
--color-gold: #E7B95A;           /* primary: glows, highlights, CTA fill, extruded text */
--color-gold-hi: color-mix(in oklab, #E7B95A 62%, #fff);   /* light gold: text on dark */
--color-gold-deep: color-mix(in oklab, #E7B95A 40%, #000); /* extrusion bottom, pressed */
--color-pitch: #54E0A0;          /* third colour = "confirmed": paid, live dots, lineup ready */
--color-text: #F4EFE3;
--color-muted: #A9A293;          /* passes 4.5:1 on ink */
--color-on-gold: #1A1304;        /* text on gold fills */

/* glass */
--glass-surface: rgba(255,255,255,.05);
--glass-border: color-mix(in oklab, #E7B95A 20%, transparent);
--glass-highlight: inset 0 1px 0 rgba(255,255,255,.07);
--glass-shadow: 0 30px 80px rgba(0,0,0,.5);
--glass-blur: blur(24px) saturate(150%);
--hairline: color-mix(in oklab, #E7B95A 15%, transparent);

/* easing */
--ease-out-kl: cubic-bezier(.2,.8,.2,1);
--spring-soft: linear(0,.09 3%,.34 8%,.7 15%,.95 22%,1.06 29%,1.08 34%,1.05 42%,1.01 54%,.995 66%,1);
--spring-pop:  linear(0,.16 3%,.56 9%,1.02 16%,1.2 22%,1.19 27%,1.05 36%,.95 45%,.96 54%,1.01 66%,1);
```

Colour roles:
- **Gold** is the brand: main CTA fill (`bg-gold text-on-gold`, hover `gold-hi`), eyebrows, highlighted words, extruded display text, background glows.
- **Pitch green** means "confirmed": live/status dots, "Paid", "Lineup ready", the waitlist player, "Free". Never use it for large areas.

**Extruded 3D text** (class `.ext` in the reference): colour `gold-hi` + six 1 px stacked shadows stepping from gold to gold-deep + a soft drop:
```css
text-shadow: 0 1px 0 color-mix(in oklab,var(--gold) 88%,#000), 0 2px 0 color-mix(in oklab,var(--gold) 78%,#000),
  0 3px 0 color-mix(in oklab,var(--gold) 68%,#000), 0 4px 0 color-mix(in oklab,var(--gold) 58%,#000),
  0 5px 0 color-mix(in oklab,var(--gold) 49%,#000), 0 6px 0 var(--gold-deep), 0 24px 36px rgba(0,0,0,.6);
```

**Background recipe** (both pages): ink base + 3–4 absolutely/fixed-positioned blurred circles (`filter: blur(110px)`): gold at `--glow` (default 0.30) opacity top-left, gold ~0.18 right-middle, a large `color-mix(pitch 16%, deep)` bottom-left, gold ~0.22 bottom-right. Each drifts `translate(90px,70px) scale(1.12)` alternate over 22–30 s.

**Cursor spotlight** (desktop, hover-capable only): a 720 px radial gold glow (20%) with `mix-blend-mode: screen` that follows the pointer on a spring (stiffness ~120, damping ~16). In Motion: `useMotionValue` + `useSpring`.

## 4. Typography

- Family: **Archivo** variable with **width (`wdth` 62–125) and weight** axes. Prefer `next/font/google` (`Archivo({ subsets:['latin'], axes:['wdth'], variable:'--font-archivo' })`), or `@fontsource-variable/archivo` if its wdth axis file is available. Apply it to the marketing and auth route groups only (a wrapper class or layout-level `className`). The in-app screens keep Plus Jakarta Sans / Space Grotesk unless the user says otherwise.
- Display (hero h1): 800, `clamp(56px, 8.4vw, 124px)`, tracking −0.03em, line-height 0.95.
- Section titles: 800, `clamp(42px, 5.2vw, 76px)`, tracking −0.03em, line-height 0.96, `text-wrap: balance`.
- Wordmark / eyebrows / step labels: `font-stretch: 118–125%`, uppercase, tracking 0.14–0.2em, 12–15 px, 700.
- Body 17–20 px, 400–500, line-height 1.55. Lede colour `#CFC8B8`, muted `#A9A293`.

## 5. Shape, spacing, buttons

- Radius: 12 buttons/chips/inputs, 20 nav, 28–32 panels/cards, 999 dots/pills.
- Section padding `clamp(80px, 11vw, 160px)` vertical; container max 1280 px; gutter 24 px.
- Glass for nav, floating chips, forms and stacked panels. **No card grids**: separate content with hairlines and space.
- Buttons 52 px tall (44 in nav). Primary: gold fill, `on-gold` text, 800, `font-stretch:108%`, glow shadow `0 16px 36px -16px gold/85%`. Secondary: blue-free glass `color-mix(gold 8%, white 3%)` + 1 px gold/55% border.
- **Magnetic buttons** (all primary/secondary CTAs): on pointer move, translate up to ±7 px x / ±5 px y and rotate ±2° toward the pointer; on leave, spring back (`spring-pop`, 0.8 s); on press, scale 0.92. Use Motion springs, and make it a reusable `<MagneticButton>` wrapping the existing `Button`/`Link`.

## 6. Landing page: sections in order

Copy is in the reference; reuse the existing `FEATURES` / `STEPS` arrays in `page.tsx` where they match.

1. **Sticky glass nav** (`top:16px`, h 64, radius 20): logo (two interlocking gold rings SVG + "KICKLINK" wide/uppercase), links Features `#features` / How it works `#how` / For organizers `#clubs`, "Log in" text link, "Get started" primary. A 2 px gold→pitch **scroll-progress line** along the bottom (`useScroll()` → `scaleX`). Below 860 px, hide the links and Log in.
2. **Hero:** glass eyebrow chip with pulsing green dot "Pickup games, organized". H1 "Lock the lineup / before kickoff." split into letters that **flip in** (from `y:96, rotateX:-100°, opacity 0`, spring-soft 1 s, 35 ms stagger, 220 ms start); "kickoff." is extruded gold. Then a two-column grid: lede, CTAs (Get started free → `/signup`, Log in), fine print, sport pills; and the **hero 3D pitch** with 14 players dropping in (`translateZ 240→0`, staggered 90 ms from 700 ms) plus three floating glass cards that pop (spring-pop) then bob. The pitch slowly sways. Replaces `hero-preview.tsx`.
3. **Pinned "Game day" story:** the centrepiece. Full spec in section 7.
4. **Velocity ticker:** two full-bleed tape bands crossing at −4° / +3°. Band 1 is gold with ink text listing the six sports; band 2 is dark glass with gold text: "Lineup locked · Paid before kickoff · Waitlist on · No group chat scramble". Infinite marquee (38 s / 44 s, opposite directions). **Scroll velocity** (`useVelocity(scrollY)`) multiplies speed up to 6× (reversing direction when scrolling up) and skews the bands up to ±10°.
5. **Word-by-word statement:** "The group chat was never a roster. KickLink locks the lineup, takes the fee and fills the gap." ("was never a roster." muted, "locks the lineup," gold, "fills the gap." green). Each word resolves from `opacity .12, blur 8px, rotateX -80°, y 24` as it scrolls into view (per-word `useScroll` target, or one `useScroll` with offsets per index).
6. **Step ring `#how`:** pinned section (~2400 px tall, sticky stage). The three steps (Join your club / Claim a spot / Show up and play, with big extruded 01/02/03) sit on a `rotateY` cylinder: faces 72° apart, radius 380 px, ring at `translateZ(-380px)`. Scroll turns the ring 0 → −144°. The front face is opacity 1, the others 0.2, with `backface-visibility: hidden`.
7. **Stacked feature panels `#features`:** header + six sticky glass panels (`top: 112px + i*18px`, radius 30, opaque-ish `rgba(17,17,21,.8)` so they cover each other). Each panel tilts up on arrival (`rotateX 26°→0, y 90→0, scale .94→1`) and, as the next panel arrives, the covered one sinks (`scale .92, y -24, blur 3px, brightness .5`). Each panel has a small "mock rows" UI on the right with status pills (see reference for exact copy and pill colours).
8. **Audience list:** eyebrow "Any sport with a lineup" + an `<ol>` of the six sports in huge type (`clamp(52px,9vw,140px)`), hairline rows, index numbers. On hover the word turns gold, extrudes and slides 18 px right (spring-pop); the index turns green.
9. **Quote:** gold quote mark, `[ORGANIZER QUOTE…]`, caption `[NAME] · [ROLE], [CLUB]`.
10. **Pricing as hover rows** (not cards): Players / Free (green) → `/signup`; Organizers / `[PRICE]`; Paid games / `[FEE]`. Rows highlight with glass on hover and an arrow tile slides right and fills gold.
11. **Contact `#clubs`:** "Organize a club? Get your weekends back." + a glass form card that **tilts toward the pointer** (±7° X, ±9° Y, perspective 1400, springs back). Fields: name, email, club name, sport select, "How does your club run today?" textarea, "Start organizing". **Ask the user** where this form should submit (no endpoint exists yet). Until then, show the prototype's "You are on the list." success state client-side and leave a `TODO`.
12. **Footer:** logo, links (incl. `/privacy`, `/terms`), a giant extruded "KICKLINK" wordmark whose letters tumble in (`y 70%, rotateX -110°, rotateZ -8°` → rest, spring-pop, staggered) as the footer enters, and "© 2026 KickLink · Ottawa, ON".

Blur-up reveal (`opacity 0, y 60, blur 6px` → rest) on section headers, list rows and pricing rows. You can extend the existing `Reveal` with a `blur` prop.

## 7. The "Game day" pinned story (Motion, scroll-scrubbed)

The user called this section "perfect", so match it closely. Implement as a client component, e.g. `components/marketing/game-day-story.tsx`.

**Structure:** `<section>` 4600 px tall → sticky stage `height: min(100vh, 940px)` → grid `minmax(280px,400px) | 1fr`.
- Left: eyebrow "Game day, start to whistle", step pills (01 Post · 02 Claim · 03 Swap · 04 Lock, active one gold-filled and scaled 1.06), four captions stacked in one grid cell.
- Right: status chips (Sunday Night 7s · `n/14 claimed` · `$n collected`, all `white-space: nowrap`), the 3D scene, the "LINEUP LOCKED" stamp, sparks, the "Lineup ready · Kickoff [TIME]" chip.

**Scene geometry:** `perspective: 1700px` on the scene. A `.fit` wrapper (820×600, `preserve-3d`) is scaled to fit its column (`min(1, w/840, h/600)` via ResizeObserver). Inside it, the pitch plane is 760×460, radius 26, `transform: rotateX(var(--tilt)) rotateY(var(--spinY)) rotateZ(var(--yaw)) scale(var(--sc))`, with these registered as `@property` (`<angle>`/`<number>`, `inherits: true`) so children can read them. Players are 0-size `preserve-3d` anchors at slot px positions. Each pin stands up with `translate(-50%,-100%) rotateZ(calc(var(--yaw)*-1)) rotateX(-90deg)` (origin bottom centre), and its head faces the viewer with `rotateX(calc(90deg - var(--tilt)))`. Slots are the 7v7 positions in the reference's `S` array (% of 760×460). Team A = gold heads, team B = cream, waitlist = green.

**Timeline:** one master timeline of 10 units, scrubbed by `useScroll({ target: section, offset: ['start start','end end'] })`. In React, either build a Motion `animate()` sequence on refs and drive it from `scrollYProgress` (`anim.time = p * duration` in `useMotionValueEvent`), or use `useTransform` per value. Base markup = final state. Times are in units of the 10-unit timeline:

| t | What happens |
|---|---|
| 0–1.0 | Pitch starts as a face-on **game card** (tilt 12°, spinY −26°, yaw 4°, sc 0.5 → tilt 0, spinY 0, sc 0.58). Card overlay: "New game" tag, "Brewer Park Turf", **Sunday Night 7s**, `[DATE] · [TIME]` · $12 a spot · 14 spots, gold "Post to club" button. Caption 1 visible. |
| 0.95–1.25 | Button squishes (scale 1→.94→1) and turns green: "Posted · link sent to club". |
| 1.4–2.6 | Card **flips down into the pitch**: tilt 0→58°, yaw 0→−14°, sc .58→1 (easeInOut `[.65,0,.35,1]`). Overlay fades 1.75–2.2. Dashed slots fade in from 2.1 (20 ms stagger). |
| 2.1–3.3 | **Floodlights:** towers fade in (2.1), then power on corner by corner (order TL, TR, BR, BL, 0.2 apart from 2.4). Each flickers on (glow opacity 0,1,.15,1,.5,1) with its turf light pool. |
| 2.3 / 2.6 | Caption 1 out (y −40, blur 8, fade) / caption 2 in (from y 40, blur 8). |
| 2.7–5.2 | **14 players rain in**, one every 0.16. Each drops `translateZ 460→0` with a small bounce (keyframes 460, 0, 26, 0 at times 0/.62/.8/1, 0.5 long). On landing: a gold ripple ring (scale .3→2.8, fade) and a green **"+$12"** floats up (y 8→−58). Counters tick live: claimed = landed count, collected = claimed × 12. |
| 5.1 / 5.4 | Caption 2 out / caption 3 in. |
| 5.35–6.35 | **Camera swings**: yaw −14→16°, tilt 58→46°, sc 1→.92. A dashed green "Waitlist" bench appears off the bottom touchline, and three green waitlist players (#17, #21, #23) drop onto it. |
| 5.95–6.55 | Floodlights **falter**: glow 1→.3→.75→.25→.35, pools and LED strips dim to match. |
| 6.0–6.8 | Player **#6 (index 10) is launched off the pitch** (up, right and spinning to `translate3d(190px,-110px,600px) rotateZ(80deg)`) and fades. A glowing green "open spot" ring pulses at its slot. Claimed 14→13. |
| 6.8–7.65 | First waitlist player **hops in an arc** from the bench to the open slot (peak z 230, small landing bounce). On landing (7.45): ripple + "+$12", claimed 13→14, **floodlights snap back** to full. The other two bench players shuffle along. |
| 7.6 / 7.9 | Caption 3 out / caption 4 in ("Lineup locked."). |
| 7.7–9.0 | Camera settles: yaw 16→−6°, tilt 46→56°, sc .92→1.04. |
| 8.0–8.9 | **Team link lines draw** between teammates (SVG paths, `pathLength=1`, dashoffset 1→0, 25 ms stagger; gold with glow for team A, cream 60% for B). A gold **light sweep** crosses the pitch (8.15–9.05). |
| 8.15 / 8.6 | Floodlight flares chase the sweep: left pair, then right pair. |
| 8.6 | All ripples pulse (25 ms stagger). |
| 8.88–9.5 | **Stamp:** "LINEUP" (gold, extruded) / "LOCKED" (green, extruded), wide 125%, `clamp(48px,7vw,104px)`, slams in (scale 2.6→1, rotate −18→−6°, blur 16→0, spring-pop). Floodlights **strobe 3×**, with a full-scene warm white flash (opacity 0,.6,0,.45,0,.25,0). |
| 9.05–9.95 | 22 sparks (gold/green, two sizes) burst radially from the stamp and fall. |
| 9.3 | "Lineup ready · Kickoff [TIME]" chip pops (spring-pop). |

**Floodlights (minimal style; the user asked for sleek/modern):** four towers just outside the pitch corners, standing like the players (same counter-rotation). Each is a 2 px hairline mast fading upward (`rgba(244,239,227,.55)` → `.06`, 160 px tall), topped by a slim 52×12 dark bar (`#121215`, 1 px border at 14%, radius 6) with one glowing 3 px warm LED strip (`#FFF8E8` + glow) on its underside. Below each: a soft elliptical glow (220×140), a larger burst layer for flashes, and a turf "light pool" ellipse clipped to the pitch.

**Without JS / reduced motion:** the section is normal height (not pinned), all four captions are listed, and the scene shows the final locked lineup with the lights steady on.

**Mobile (<860 px):** single column, captions above the scene, smaller caption type, scene 420 px tall, money chip hidden.

## 8. Login page

Replace the current split `AuthShell` look with the reference layout. Keep the shell as the layout component so `/signup`, `/forgot`, `/reset` and `/verify` pick it up. **Ask the user** whether those pages should get the same treatment now, or only `/login`.

- **Left panel** (`flex: 1.2`): logo (the two rings slide together on load, spring-pop), eyebrow "Your club, sorted", h2 "Find your team. / **Play every week.**" (extruded gold), lede, then the **passing scene**: a 560×340 3D pitch (rotateX 57°, gentle sway) with 9 players. A 7-second loop: a gold pass line draws along GK → LB → CM → RW → ST → goal (`stroke-dashoffset`, `pathLength=1`) while a white ball travels the same path (`offset-path`). Each receiver's gold halo flashes as the ball arrives (delays 0, .97, 1.94, 2.81, 3.89 s), and the goal mouth flashes gold at 70% of the loop. Faint white network lines connect all players. Two floating glass chips: "Sunday Night 7s · 14/14" (green dot) and "✓ $12 paid · Spot confirmed". Underneath, the three existing `FEATURES` from `auth-shell.tsx` in a hairline-topped 3-column row.
- **Right:** glass card (max 460, radius 30) that tilts toward the pointer. "Welcome back" letters flip in; subtitle "Log in to see your games, clubs and payments."; Google button (glass secondary, existing G icon; only when `isGoogleEnabled()`); "or" divider; email + password fields (52 px, radius 12; label turns gold and the field gets a gold glow ring on focus); a working **show/hide password** button (`aria-label` + `aria-pressed`); "Forgot password?"; full-width magnetic gold "Log in →" whose pending state shows a spinner + "Logging in…" (wire to `useFormStatus`); "New to KickLink? **Create an account**". Error/`needsVerification` messages: style `AuthError` as a glass row with a warm red/amber tint that matches the theme.
- **Mobile (<980 px):** art panel on top with the scene shrunk (scale .62), features hidden, card below.

## 9. Reading the reference files

`reference/*.dc.html` are Claude Design canvas files, plain HTML with a small template layer:
- Markup lives inside `<x-dc>`. `<helmet><style>` holds the CSS, which is the most useful part: all sizes, colours and keyframes are there verbatim.
- `{{name}}` holes and `<sc-for list="{{items}}" as="item">` / `<sc-if value="{{cond}}">` are filled from `renderVals()` in the `<script type="text/x-dc">` block at the bottom. That script also has the data arrays (slot positions `S`, jersey numbers `N`, edge list `E`, sparks) and the full Motion sequence for the story in `buildStory()`, which is the source of truth for section 7's timings.
- `ref="{{refX}}"` = React-style callback refs. `onPointerMove="{{mag}}"` etc. = event handlers defined in `ensure()`.
- `Main.dc.html` links to `Login.dc.html` for the prototype; in the app those are `/` and `/login`.
- Tweakable props in `data-props`: gold `#E7B95A`, pitch `#54E0A0`, glow 0.30, spotlight on.

## 10. Suggested order and acceptance

1. Tokens + font + background/glows/spotlight + `MagneticButton` + glass utilities.
2. Login page (smaller; proves the system). Run the real login flow end to end.
3. Landing sections 1–2, 4–12.
4. Game-day story (section 7) last, as its own component.
5. Check: `npm run lint`, typecheck, build; the existing CI (`.github/workflows/web-ci.yml`) passes.

Done when:
- [ ] Both pages match the references at 1440 px and 390 px wide; no horizontal scroll at any width.
- [ ] Every scroll scene scrubs smoothly forwards and backwards; the story's counters and step pills stay in sync when scrolling up.
- [ ] Reduced motion shows final states with no animation; the page is readable with JS disabled.
- [ ] Login, Google login (when enabled), resend verification, forgot-password and the `returnTo` redirect all still work.
- [ ] Lighthouse accessibility ≥ 95 on both pages; no console errors.
- [ ] The placeholder list in section 2 is reported back to the user as still to fill.
