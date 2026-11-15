---
name: accessly-design
description: Accessly's visual design system (blue/cyan palette, blue rounded headers, pill controls, rounded cards) applied through the repo's CSS tokens and WCAG 2.2 AA rules. Use for any Accessly UI, page, component or restyle, instead of frontend-design.
---

# Accessly design system

The approved hi-fi prototype (Claude Design canvas "Accessly – High-Fidelity Prototype") defines how every Accessly screen looks. This skill translates it into this repo's stack: **plain CSS with variables in `app/globals.css`, no Tailwind**, shared components in `components/ui/`, header/tabs in `components/SiteHeader.js` + `components/TabBar.js`. `CLAUDE.md` stays the source of truth for product, privacy and accessibility rules; this file is the source of truth for the *look*.

Feel: friendly, calm, confident. Light gray canvas, white rounded cards, a bold blue header with rounded bottom corners, cyan as the one bright accent, pill-shaped controls, big bold dates.

## Hard rules

1. **Blues only.** No yellow, purple, violet, pink or orange as decoration. Green/amber/red appear only inside status badges and notices (always with icon + text).
2. **No black (or near-black) backgrounds.** `--text` is for text only. Fills come from the blue palette, white, or the canvas gray.
3. **Repo accessibility rules win** (from `CLAUDE.md`): WCAG 2.2 AA, readable text never below 16px, body 18px / 1.6, touch targets ≥ 44×44px, never color-only meaning, works at 320px and 200% zoom, respects dark mode and `prefers-reduced-motion`.
4. **Text on fills:**
   - Dark text (`--text`) on cyan, sky, tints and white. Never white text on `--cyan` or `--sky`.
   - White text only on `--primary`, `--primary-hover` or `--teal-fill`.
5. **Focus:** `3px` outline, `--focus` (amber) on light surfaces; inside the blue header and on any blue/teal fill use `--focus-on-fill` (white) so the ring stays ≥ 3:1 against its background.
6. **Fonts stay as configured:** Bricolage Grotesque (`--font-heading`) for headings, buttons, tabs, numbers; Atkinson Hyperlegible (`--font-text`) for body, fields, chat. Headings in this style are heavy: 700–800.
7. Icons: `lucide-react`, `aria-hidden="true"`, always next to a visible label (or the control gets an `aria-label`). No emoji.
8. Unknown facts use `[PLACEHOLDER]` brackets; seed data is labelled EXAMPLE. Never invent accessibility facts.

## Tokens (defined in `app/globals.css`)

Existing tokens (keep, contrast-checked): `--brand #0097b2` (logo/decor only), `--accent #00758a`, `--primary #014cae`, `--primary-hover #013a85`, `--primary-tint #e6f4fb`, `--text #1a1a1a`, `--muted #4a4a4a`, `--border`, `--border-strong`, `--focus #b45309`, status colors.

Prototype tokens (added in the "Hi-fi prototype tokens" block):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--canvas` | `#f4f5f7` | `#121212` | page background behind cards |
| `--cyan` | `#5ce1e6` | `#5ce1e6` | active tab, selected chips/answers, main CTA pill, FAB, avatar |
| `--on-cyan` | `#1a1a1a` | `#121212` | text/icons on cyan |
| `--sky` | `#a8d1ff` | `#24476e` | light fills: count pills, date tiles, 2nd card color |
| `--on-sky` | `#1a1a1a` | `#f2f2f2` | text on sky |
| `--teal-fill` | `#00758a` | `#0e5f6e` | 3rd card color, "Thinking…" pill, unread badge, feature cards (white text) |
| `--cyan-tint` | `#d9f7f9` | `#0d3a3e` | feature badges, info notes |
| `--header-bg` | `#014cae` | `#0f2f57` | blue app header |
| `--on-header` | `#ffffff` | `#f2f2f2` | text on the header |
| `--focus-on-fill` | `#ffffff` | `#ffffff` | focus ring on blue/teal fills |
| `--radius-lg` | `20px` | | cards |
| `--radius-xl` | `24px` | | colored/hero cards, menu cards |
| `--radius-header` | `28px` | | header bottom corners |
| `--shadow-card` | `0 1px 2px rgb(11 18 32 / .04), 0 4px 16px -6px rgb(11 18 32 / .06)` | `none` (use `--border`) | cards |

**Color rotation** for any set of colored items (event cards, location thumbnails, create-event step numbers, date tiles): `--primary` (white text) → `--sky` (`--on-sky`) → `--teal-fill` (white text), repeat.

## Type scale
- Page title (`h1`): heading font, 800, `clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)`, letter-spacing −0.01em.
- Section (`h2`): 1.5rem / 800. Card title (`h3`): 1.25rem / 800.
- Body 1.125rem. Meta, badges, chips: **1rem minimum**, weight 600–700.
- Big date numeral on event cards: heading font 2.25rem / 800 / line-height 1.
- CTA labels: heading font 1.0625rem / 800, uppercase, letter-spacing 0.04em.

## Components (prototype → repo)

**Page background**: `body` uses `--canvas`; content sits in white cards (`.card`: `--surface`, `--radius-lg`, `--shadow-card`, no border in light mode, `--border` in dark mode).

**App header** (`SiteHeader` + `TabBar`): full-width block, `background: var(--header-bg)`, `color: var(--on-header)`, `border-radius: 0 0 var(--radius-header) var(--radius-header)`, padding `1.125rem var(--gutter) 1rem`. Inside: white wordmark (`accessly-wordmark-web-dark.svg` works on blue) or icon linking Home; a **white pill track** (`background: var(--surface); border-radius: 999px; padding: 4px; display: flex; gap: 2px`) holding the tabs Explore / Organizer / Profile (each `flex: 1; min-height: 44px; border-radius: 999px; font: 600 1rem var(--font-heading); color: var(--text)`); the current tab gets `background: var(--cyan); color: var(--on-cyan); font-weight: 800` plus `aria-current="page"`. To the right a 52px white circle avatar (`--surface`, initials or the chosen avatar). Focus ring inside the header: `--focus-on-fill`. Desktop: same block, content max-width 1120px, "Ask Ally" as a cyan pill on the right.

**Back header** (detail pages: Ally, Create event, event/building pages on mobile): same blue block; a 44px white rounded (14px) back button with chevron-left (`BackLink` restyled), title in `--on-header` 1.25rem/800, subtitle `#d6e4ff` (light) / `--muted` equivalent in dark.

**Primary CTA pill** (Save profile, Publish event, Send request): `.btn.btn-cta` — `min-height: 56px; border-radius: 999px; background: var(--cyan); color: var(--on-cyan); border: none; text-transform: uppercase; font-weight: 800; padding-inline: 1.5rem 0.5rem; justify-content: space-between`, with a trailing 40px circle (`border: 1.5px solid currentColor`) holding `ArrowRight`. Full-width on mobile.

**Create / new actions**: cyan pill with `CalendarPlus`/`Plus` icon, or a 60px cyan circle FAB (`aria-label="Create event"`).

**Filled blue button** (Respond, Send message, Ask): existing `.btn` (`--primary`, white) with `.btn-pill`.

**Outlined pill**: `.btn-secondary.btn-pill` (`--surface`, `--border-strong`).

**Chips / multi-select needs** (`NeedChips`, `.chip-button`): pills `min-height: 44px; padding: 0 1rem; border-radius: 999px; background: var(--surface); border: 1px solid var(--border)`; selected → `background: var(--cyan); border-color: var(--cyan); color: var(--on-cyan); font-weight: 800` + leading `Check` icon + `aria-pressed="true"` (or a visually-hidden checkbox inside the `<label>`). Show "N selected".

**Yes / No / Not sure** (questionnaire): three equal pill buttons in a row, chip on/off styles, `aria-pressed`.

**Search**: white pill `min-height: 56px; border-radius: 999px; box-shadow: var(--shadow-card)`, search icon left, visible or visually-hidden `<label>`, optional 44px canvas circle filter button right.

**Inputs**: `min-height: 52px; border-radius: 14px; border: 1px solid var(--border-strong)`; inside white cards use `background: var(--canvas)`. Textareas radius 20px. Labels visible, 1rem/700.

**List row** (`SpaceCard`, organizer "Your events"): white card, `display: flex; gap: 0.875rem; align-items: center; padding: 0.625rem 0.875rem 0.625rem 0.625rem`; leading 64–72px square (`border-radius: 16px`) in the color rotation holding an icon or a date (day 1.5rem/800 over month 1rem/700); title 1.125rem/800; meta 1rem `--muted` with `MapPin`; feature badges `background: var(--cyan-tint); border-radius: 999px; font-weight: 700`; trailing `ChevronRight`.

**Colored event card** (`EventCard`): `border-radius: var(--radius-xl); padding: 1.125rem` in the color rotation; top row = big day numeral + "Nov · 6:00 PM" and a type tag pill in a contrasting fill (cyan on blue/teal, primary on sky); title `h3` 800; place line; feature badges `rgb(255 255 255 / .16)` on blue/teal or `rgb(26 26 26 / .1)` on sky; white pill "Request an accommodation" link. Whole-card link pattern (`.card-link`) still applies.

**Status badge** (`StatusBadge`): pill `padding: 0.25rem 0.75rem; font-weight: 700` with icon + text and a soft fill: awaiting `#fef3c7`/`--status-awaiting`, in progress `--primary-tint`/`--status-in-progress`, confirmed `#dcfae6`/`--status-confirmed`, can't `#fde8e7`/`--status-cannot`. Check contrast in dark mode.

**Request card** (organizer): white card, status badge on top, need as `h3`, "Event · Anonymous · 2h ago" meta, action pill on the right (Respond = filled blue, Update = outlined).

**Toggle switch**: `<input type="checkbox" role="switch">` styled 48×28, track `--border-strong`, checked `--primary`, 22px white knob, inside a full-row `<label>` (min-height 64px) with title + muted description.

**Feature card with decorative circle** (Ally intro, "Still have a question?"): `border-radius: var(--radius-xl); padding: 1.25rem; position: relative; overflow: hidden` in `--primary` or `--teal-fill` with white text; a 120–140px `--cyan` circle at top-right (−40 to −50px offsets, `aria-hidden`); text wrapped in `position: relative`.

**Chat** (`Chat`, Ally): Ally bubbles white, `border-radius: 6px 22px 22px 22px`, `--shadow-card`; user bubbles `--primary` with white text, `border-radius: 22px 6px 22px 22px`; "Thinking…" = `--teal-fill` pill with a cyan spinner (static under `prefers-reduced-motion`) in an `aria-live="polite"` region; composer = `--canvas` pill containing the labelled input and a 48px `--primary` circular send button (`aria-label="Send"`); suggestion chips `--primary-tint` with `--sky` border.

**Home** (`/`): full `--header-bg` blue screen with large decorative circles (`--cyan` top-right, `--primary-hover` bottom-left, `--teal-fill` bottom-right, small `--sky` dot; all `aria-hidden`), the 84px app icon (radius 24px), the white wordmark, a 1.75rem/800 white headline "Know before you go." and three stacked menu cards (`--radius-xl`, min-height 76px): Go somewhere = cyan, Events = sky, Quick start = white; each with an icon well, title/subtitle and an outlined arrow circle. Desktop: the three cards in a row. Text on the circles must keep ≥ 4.5:1 (keep text off the cyan circle).

**FAQ accordion** (`/privacy`, `<details>/<summary>`): inside one white card, rows divided by `--border`, summary min-height 60px, a 32px circle on the right (`--canvas`, `--cyan` when open) with a `Plus` that rotates 45° (no rotation under reduced motion).

**Notices** (`Notice`): `--cyan-tint` background with a cyan check circle for "already on file" info; keep the existing success/warning/error variants for status.

**Spacing**: page gutter `var(--gutter)`; section gap 1.25–1.5rem; list gap 0.625–1rem.

## Brand assets (already in `public/brand/`)
- `accessly-icon-web.svg`: app icon, Home logo, Ally avatar (`alt=""` when next to the wordmark).
- `accessly-wordmark-web.svg`: teal wordmark on light; `accessly-wordmark-web-dark.svg` (cyan): on the blue header and in dark mode. `alt="Accessly"`.
- The cyan→blue gradient lives only inside the logo, never as a UI background.

## Voice
Short, warm, plain. Privacy reassurance next to any data entry ("Only shared with an organizer when you send them a request."). Never ask why someone needs something. Ally always says what it couldn't verify and where to confirm.

## Before finishing any screen
- [ ] Only palette colors; no black, yellow or purple fills
- [ ] Blue rounded-bottom header with the white tab track and cyan current tab
- [ ] Main action is the cyan uppercase CTA pill with the arrow circle
- [ ] Colored sets follow primary → sky → teal
- [ ] Every control ≥ 44px, semantic element, visible label or `aria-label`
- [ ] Text ≥ 16px; contrast AA on every fill, in light **and** dark mode
- [ ] Focus visible everywhere (white ring on blue fills)
- [ ] Status and selection never by color alone
- [ ] `npm run build` passes
