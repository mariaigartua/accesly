# Accessly — project context for Claude

> Read this whole file before making changes. It is the source of truth for what Accessly is, how it looks, and what to build next.
> Repo is named `accesly`; the product name is **Accessly** (matches the logo).

## What this is
Accessly is a solo HackUMass XIV hackathon project (Nov 2026) by Maria Jose Igartua.
Tracks: **Public Good → Best Accessibility Hack**, plus MLH prizes for **Gemini API**, **MongoDB Atlas**, and **Vultr** (hosting).

**Problem:** Event pages handle accessibility with one line: "For accessibility inquiries email…". Attendees must find a contact, explain their situation, and often disclose a disability just to learn if there's an elevator. Most college students with disabilities never disclose them to their school (NCES: ~37% do), largely because of stigma and a wish for independence.

**Solution:** Make campus spaces, student-org events, and getting around accessible *without* people revealing data about themselves.

Tagline: *Know before you go. Ask for what you need, without explaining why.*

## Non-negotiable principles
1. **Privacy first.**
   - The **Profile lives only on the user's device** (`localStorage`). It is never sent to the server as a whole. Only the specific needs the user ticks on a given request are sent, and only when they press send.
   - Requests store needs, not diagnoses or identities. **Anonymous is the default.** Contact info only if the user turns on "Can contact me" for that request.
   - No attendee accounts. Attendees reach their requests via private token links (saved locally under Profile → My requests).
   - Requests and their chat messages auto-delete 7 days after the event (TTL index on `deleteAfter`). Never log Ally or event-chat questions.
2. **Grounded, responsible AI.**
   - Event chat answers **only** from the event + space documents. If info is missing: say it's not confirmed by the organizer and offer an anonymous request.
   - Ally answers from Accessly's own Spaces data plus Gemini **Google Search grounding**, always shows its sources, says clearly when it isn't sure, and tells the user to confirm time-sensitive or safety-critical info with the official source (e.g. the bus operator). Never invent accessibility facts — wrong info can strand someone.
3. **The app itself must be accessible — WCAG 2.2 AA minimum** (judges will test with keyboard and screen reader). See "Accessibility checklist".
4. **Never ask anyone *why*** they need something.

## Brand and visual design
Friendly, calm, rounded, lots of white space. Mobile-first, fully responsive.
**The look follows the `accessly-design` skill** (hi-fi prototype: gray canvas, white cards, blue rounded-bottom header with a white tab track and cyan current tab, cyan uppercase CTA pills with an arrow circle, colored card rotation primary → sky → teal). Its prototype tokens live in `app/globals.css` next to the ones below. Home (`/`) is a full-screen blue splash with no app header (centered white wordmark, drifting circles with a Pause button for WCAG 2.2.2). Shared pickers: `components/ui/Pickers.js` (ChipPicker, Segmented, Switch).

**Logos** (in `public/brand/`):
- `accessly-icon.svg` — white figure (arms up) on a cyan→deep-blue gradient square. Use for the app icon/favicon, the Home logo, and the Ally avatar.
- `accessly-wordmark.svg` — "Accessly" in brand teal with the figure as the "y". Use in the header.
- Both need `alt` text: icon `alt=""` when next to the wordmark (decorative), wordmark `alt="Accessly"`.
- **In the app use the web variants** (the originals are 768×768 with a white background and a 374 KB embedded PNG): `accessly-icon-web.svg` (pure vector, rounded, also `app/icon.svg` favicon), `accessly-wordmark-web.svg` (cropped, transparent, teal), `accessly-wordmark-web-white.svg` (on the blue header and Home splash) and `accessly-wordmark-web-dark.svg` (cyan).
- Shared UI lives in `components/ui/` (Button, Card, StatusBadge, NeedChips/TopicChips/NeedIcon, Notice, Stepper, BackLink, EventCard); header/tabs in `components/SiteHeader.js` + `components/TabBar.js`.

**Color tokens** (contrast checked — don't swap without re-checking):
| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand` | `#0097b2` | `#5ce1e6` | Logo, large headings ≥24px, decorative accents ONLY (3.46:1 on white — fails for body text) |
| `--accent` | `#00758a` | `#5ce1e6` | Links, text accents, focus-adjacent UI (5.37:1 on white) |
| `--primary` | `#014cae` | `#8ab4f8` | Primary buttons (white text on light: ~7.8:1; on dark use text `#121212`) |
| `--primary-tint` | `#e6f4fb` | `#0d2a3a` | Home background, selected tab, soft cards |
| `--bg` / `--text` | `#ffffff` / `#1a1a1a` | `#121212` / `#f2f2f2` | Base |
| `--muted` | `#4a4a4a` | `#c8c8c8` | Secondary text |
| `--focus` | `#b45309` | `#fbbf24` | 3px focus outline, always visible |
| status | awaiting `#8a5a00`, in progress `#014cae`, confirmed `#1b7f3b`, can't `#b3261e` | lighter equivalents | Always paired with a text label + icon, never color alone |

- The cyan→blue gradient is allowed only behind the logo/icon and as the Home hero background **with white text ≥24px on the darker half**, or use `--primary-tint` with dark text (safer).
- **Fonts** (both via `next/font/google`):
  - **Bricolage Grotesque** — the brand font (used in the logo). Use for the wordmark, headings, buttons, and tab labels.
  - **Atkinson Hyperlegible** — body text, form fields, chat messages, and long text. It's designed for low-vision readability.
  - Body 18px, line-height 1.6. Headings weight 600–700. Never go below 16px for any readable text.
- Shapes: cards `border-radius: 16px`, buttons 12px, pills 999px. Soft 1px borders, no heavy shadows.
- Icons: always paired with a visible text label. Use an icon set (e.g. `lucide-react`) with `aria-hidden="true"`.

## Navigation and screens
Main sections: **Home**, **Explore**, **Organizer**, **Profile**, and **Ally** (AI guide).

**Nav bar** (from sketches): a tab bar with text labels — `Explore | Organizer | Profile (avatar)` — plus the logo linking to Home and an "Ask Ally" entry. Current tab: highlighted pill + `aria-current="page"`. Every tab ≥44×44px.
- Mobile (<640px): sticky top bar as sketched (logo icon + tabs). Ally opens from the Home button and a floating "Ask Ally" button bottom-right (labelled, not icon-only).
- Desktop (≥1024px): header with wordmark left, tabs + "Ask Ally" right; content max-width 1120px.

### Home — main menu (`/`)
Light brand-tint background, centered logo, three large buttons (full-width on mobile, a row of three cards on desktop):
- **Go somewhere** → Ally (`/ally`)
- **Events** → Explore (`/explore#events`)
- **Quick start** → onboarding (`/start`)

### Ally — AI guide (`/ally`)
- Header: Ally avatar + "I'm Ally, your AI guide."
- Large labelled textarea: "Describe what you want to do or where you want to go, and I'll give you responsible info." + suggestion chips (e.g. "Can I take the bus to CVS in a wheelchair?", "Which buildings near me have step-free entrances?").
- Optional toggle "Use my profile needs" (sends only the selected needs, not the profile).
- Loading state "Thinking…" announced via `aria-live="polite"`.
- Answer card: plain-language answer, **Sources** list (links), "Accessly data" badge when it used Spaces, a "Not sure / confirm with…" note when relevant. Thumbs up/down optional.
- Desktop: chat column centered (max 760px), suggestions in a side column.

### Explore (`/explore`)
- "You are at **UMass Amherst**" (fixed campus for the demo, no geolocation).
- **Browse locations:** search box + list of building/space cards (name, key features as icon+label chips, "last checked" date). → **Building page** `/spaces/[id]`: all features with dates, recent reported issues, "Report an issue" (anonymous), upcoming events in this space.
- **Browse events:** search box + event cards (name, org, date, location, accessibility highlights). → **Event page** `/events/[id]` (already built: summary, grounded chat, anonymous request).
- **+ Create event** button → `/organizer/new`.
- Desktop: locations and events side by side in two columns; mobile: stacked sections.
- Event page desktop: info left (~60%), chat + request form right (~40%, sticky).
- Event page has two separate actions: **Request an accommodation** (form) and **Message the organizer** (opens a chat). When the AI event chat can't answer, offer both: a request if it's about a need, a chat for anything else.
- **Personalized highlights (client-side only):** if the profile has needs, the event/building page marks matching features ("Elevator — matches your needs") and missing info ("Captions — not confirmed"). Computed in the browser; nothing is sent.

### Organizer (`/organizer`)
No organizer accounts: each event's **organizer key** is saved in `localStorage` when the event is created (and can be added manually by pasting a key), so this tab lists "Your events" on this device.
- **Requests** across your events, grouped by status with actions:
  - Awaiting → **Respond**
  - In progress → **Update**
  - Confirmed → **Update**
  - (Can't accommodate → Update)
- **Your events** list → per-event view `/organizer/[id]` (already built: queue with key).
- Bottom bar (mobile) / side panel (desktop): **Chats (n)** = conversations with attendees that have unread messages → `/organizer/chats`, plus **+** create event.
- **Chats and requests are separate features:**
  - **Requests** = accommodation requests (a need + status workflow: awaiting → in progress → confirmed / can't accommodate, with an organizer reply).
  - **Chats** = any question an attendee wants to ask the organizer directly ("Is there parking nearby?", "Can I bring a friend?"). Free conversation, no status. Also anonymous by default (token-based, like requests).
- **Create event** `/organizer/new`, three steps with a progress indicator ("Step 2 of 3"):
  1. Event details (name, org, date/time, description)
  2. Select location (search saved spaces; "Add a new space" if missing)
  3. Answer questionnaire — Gemini generates follow-up questions (`/api/events/followups`) based on details + space; organizer answers or skips each.
  → **Publish event** → confirmation screen showing the organizer key once (copy button + warning) and links to the event and request queue.
- Desktop: requests left column, your events right column; create-event steps as a centered form (max 720px).

### Profile (`/profile`) — stored on this device only
- Avatar (choose from a few friendly illustrated avatars), username (optional), pronouns (optional).
- **Privacy:** ☑ Anonymous by default · ☐ Can contact me (+ contact field, only shared per request when on).
- "Describe anything helpful about accommodations" (free text).
- "Select those that apply": Need ramp/step-free · Elevator · Noise reduction / quiet space · Captions · ASL interpreter · (plus Dietary, Materials in advance, Large print).
- **My requests:** saved private status links (tokens) with status badges → `/requests/[token]` (status + organizer reply).
- **My chats:** saved private chat links (tokens) with an unread dot → `/chats/[token]`, where the attendee reads and replies.
- "Clear all my data" button.
- **Privacy & FAQ** (`/privacy`): "We care about your privacy! This is how we protect it" (bullets: device-only profile, anonymous by default, needs not reasons, auto-delete after 7 days, AI never stores your questions), an "Ask a question" box (uses Ally in help mode), and an FAQ accordion (`<details>/<summary>`).
- Desktop: profile form left, privacy summary + My requests right.

### Quick start (`/start`)
The user describes in their own words what they want to do, and Accessly sends them to the right place.
- Large labelled textarea: "What would you like to do?" plus example chips: "Create an event for my club", "Find an accessible event this week", "Can I get to the library without stairs?", "Set up my accessibility needs".
- `POST /api/start { text }` → Gemini classifies the intent into **one fixed destination** and extracts optional prefill:
  - `create-event` → `/organizer/new` (prefill event name/description)
  - `find-events` → `/explore#events` (prefill search query)
  - `find-location` → `/explore#locations` (prefill building search)
  - `ask-ally` → `/ally` (prefill the question)
  - `set-up-profile` → `/profile`
  - `privacy` → `/privacy`
  - Response shape: `{ destination, prefill: {...}, explanation }`. Only these destinations are allowed; anything unknown → `ask-ally`.
- **Confirm before redirecting** (no automatic page change; required by WCAG 3.2.2): show "I'll take you to **Create an event**. *Short explanation.*" with a primary **Go** button and "Choose something else" (lists all destinations as buttons). The result is announced via `aria-live`.
- If Gemini is unavailable, fall back to simple keyword matching, then to the list of destinations.
- Prefill is passed by query string (e.g. `/organizer/new?name=...`) and never stored.
- Optional small link: "First time? Read how we protect your privacy" → `/privacy`.

## Architecture
- **Next.js 16** (App Router), **JavaScript** (not TypeScript), React 19. Path alias `@/` → repo root.
- **MongoDB Atlas** via the official `mongodb` driver (shared client in `lib/mongodb.js`, lazy connect).
- **Gemini** via `@google/genai` (`lib/gemini.js`): retries with backoff, per-request timeouts, optional `GEMINI_FALLBACK_MODEL`. Gemini is often overloaded (503) — the UI must degrade gracefully (event chat falls back to "send a request"; Ally shows a friendly retry).
- Plain CSS with CSS variables in `app/globals.css` (no Tailwind). Mobile-first media queries at 640px and 1024px.
- Client-side storage helpers in `lib/local.js` (wrap every `localStorage` call in try/catch): `profile`, `myRequests` (tokens), `myEvents` (eventId + organizerKey).
- Deploy: Vultr Ubuntu VM with `pm2` (`npm run build && pm2 start "npm start"`). README has steps.

Env (`.env.local`, never commit): `MONGODB_URI`, `MONGODB_DB` (default `accessibility`), `GEMINI_API_KEY`, `GEMINI_MODEL`, optional `GEMINI_FALLBACK_MODEL`, optional `NEXT_PUBLIC_SITE_URL` (public address used in share links and QR codes; set it before `npm run build` on the server, otherwise the browser's address is used).

**Share event:** every event gets a unique `slug` (`lib/slug.js`, unique partial index in `ensureSetup()`). `components/ShareEventCard.js` shows the short link, Copy/Share, a QR code (`qrcode` package) with PNG/SVG download, and "Customize link" for organizers on this device. Shown on the publish screen and `/organizer/[id]`.

### API routes
| Route | Status | Notes |
|---|---|---|
| `GET /api/health` | built | Mongo + Gemini |
| `GET/POST /api/spaces` | built | add `?q=` search; add `GET /api/spaces/[id]` |
| `POST /api/spaces/[id]/reports` | **new** | anonymous issue report `{ text }` |
| `GET/POST /api/events` | built | add `?q=` and `?spaceId=` |
| `GET /api/events/[id]` | built | |
| `POST /api/events/[id]/chat` | built | grounded event Q&A |
| `POST /api/events/followups` | built | organizer questionnaire |
| `POST /api/requests` | built | change: accept `needs[]` (multiple types) |
| `GET /api/requests?eventId=` | built | `x-organizer-key`; add multi-event: `POST /api/organizer/requests { keys:[{eventId,key}] }` |
| `PATCH /api/requests/[id]` | built | statuses below + `organizerReply` |
| `GET /api/requests/status/[token]` | built | attendee view of status + reply |
| `POST /api/chats` | **new** | attendee starts a chat `{ eventId, text, contact? }` → `{ accessToken }` |
| `GET /api/chats/[token]` · `POST /api/chats/[token]/messages` | **new** | attendee reads / replies (token) |
| `POST /api/organizer/chats` | **new** | `{ keys:[{eventId,key}] }` → organizer's chats with unread counts |
| `POST /api/organizer/chats/[id]/messages` | **new** | organizer reply (`x-organizer-key`) |
| `PATCH /api/events/[id]/link` | built | `x-organizer-key`, `{ slug? }` → custom short link; no slug = make one from the name. Short links `/e/[slug]` redirect to the event |
| `POST /api/start` | **new** | Quick start intent → `{ destination, prefill, explanation }` (fixed destination list) |
| `POST /api/ally` | **new** | `{ question, needs? }` → `{ answer, sources:[{title,url}], usedSpaces:bool, caution? }`; Gemini with `googleSearch` tool + relevant Spaces docs in the prompt |

### Data model (MongoDB)
- `spaces`: `{ campus: "UMass Amherst", building, room, features: { <name>: { value, lastVerified } }, reports: [{ text, createdAt }], createdAt }`
- `events`: `{ name, org, description, startsAt, endsAt, spaceId, accessibility: { <topic>: string }, organizerKey, createdAt }` — **never return `organizerKey` from public endpoints** (projection `{ organizerKey: 0 }`).
- `requests` (accommodations): `{ eventId, needs: [type], note, contact|null, status, organizerReply, accessToken, createdAt, updatedAt, deleteAfter }` — never expose `accessToken` to organizers.
- `chats` (any question, separate from requests): `{ eventId, messages: [{ from: "attendee"|"organizer", text, createdAt }], contact|null, unreadForOrganizer: bool, unreadForAttendee: bool, accessToken, createdAt, updatedAt, deleteAfter }` — same privacy rules: anonymous by default, TTL delete 7 days after the event, token never shown to organizers.
- **Statuses:** `awaiting` (new, needs a response) → `in-progress` → `confirmed` | `cannot-accommodate`. (Rename the existing `pending` to `awaiting` everywhere, including `lib/labels.js`.)
- **Need types** (keep `lib/prompts.js` REQUEST_TYPES and `lib/labels.js` in sync): `step-free-route`, `elevator`, `noise-reduction`, `captions`, `asl-interpreter`, `reserved-seating`, `dietary`, `materials-in-advance`, `large-print`, `other`.

## Accessibility checklist (every screen)
- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, logical heading order.
- Skip link, visible 3px focus outline, logical tab order, no keyboard traps.
- Every input has a visible `<label>`; errors in text with `role="alert"` and `aria-invalid`.
- Dynamic content (chat answers, "Thinking…", status changes) in `aria-live="polite"` regions.
- Touch targets ≥44×44px; spacing between targets.
- Contrast: text ≥4.5:1, large text/icons/borders ≥3:1 — use the tokens above.
- Never color-only meaning (status = color + icon + text).
- Works at 200% zoom and 320px width without horizontal scrolling.
- Respects `prefers-reduced-motion` and dark mode.
- Images/logos have correct `alt`; decorative icons `aria-hidden`.
- Test with keyboard only and VoiceOver before demo.

## Conventions
- Next 16: route/page `params` is a Promise → `const { id } = await params;`.
- API routes: `export const dynamic = "force-dynamic"`, validate ids with `toObjectId()`, return errors via `bad()`.
- Server components read Mongo directly; client components (`"use client"`) call the API and handle `localStorage`. Pass only serializable data (stringify ObjectIds).
- Shared UI in `components/` (Button, Card, TabBar, StatusBadge, NeedChips, Stepper, AllyAnswer…). Build each once, reuse.
- Keep it simple and readable — hackathon; working over clever.
- Seed data is clearly labelled EXAMPLE. Real UMass spaces must use info Maria verified — never invent building facts.
- Run `npm run build` before every push. Clear commit messages.

## Status
**Done:** scaffold, Atlas + Gemini setup and health check, API routes (spaces, events, chat, followups, requests), attendee event page (summary, grounded chat, anonymous request), request status page, per-event organizer queue, seed script. Items 1–7 below (design system; Home/Explore/Building page with search + anonymous reports; device-only Profile, My requests, Privacy & FAQ, profile-prefilled request form, client-side highlights in `lib/highlights.js`). Item 4: need types synced (`lib/prompts.js` ↔ `lib/labels.js`, legacy `quiet-space` still displays), `POST /api/requests` takes `needs[]` (legacy `type` still accepted), statuses renamed (old `pending` docs migrated by `ensureSetup()` in `lib/mongodb.js`, which also creates the TTL/unique indexes on every server start), `chats` collection + all chat/organizer endpoints in the API table, Organizer tab (`/organizer`, `/organizer/chats`), attendee chat page `/chats/[token]`, Profile → My chats. Organizer auth helpers in `lib/organizer.js`; also `POST /api/organizer/events { key }` finds the event for a pasted key. Restyled to the hi-fi prototype in item 5.

**Build next (priority order):**
1. Design system: tokens, fonts (Bricolage Grotesque + Atkinson Hyperlegible), logos in `public/brand/`, responsive layout + TabBar, shared components. Restyle existing pages.
2. Home main menu + Explore (locations + events with search) + Building page.
3. Profile (device-only) + My requests + Privacy & FAQ; prefill request form from profile needs; personalized highlights.
4. ✅ Data model updates: statuses (`awaiting`/`in-progress`), `needs[]`; new `chats` collection + endpoints (separate from requests); Organizer tab (multi-event requests, Your events, Chats inbox).
5. ✅ Create event 3-step flow with AI questionnaire + organizer key confirmation (`/organizer/new`, `components/CreateEventFlow.js`; `/api/events/followups` falls back to `FALLBACK_FOLLOWUPS` when Gemini is down).
6. ✅ Ally (`/ally` + `/api/ally` with search grounding and sources). `generateGrounded()` in `lib/gemini.js` returns sources + Google's Search Suggestions HTML (shown in a sandboxed iframe, required by the Gemini API terms). Google Search quota is exhausted on our key and can't be raised, so after a 429 search is skipped for an hour and Ally reads hand-picked OFFICIAL pages (PVTA, UMass) from `lib/allySources.js` with Gemini's URL context tool (`generateWithUrls()`), citing only pages actually retrieved. Only add official URLs, and verify Gemini can read them first. If no page fits, Ally answers strictly from Spaces data via `ALLY_NO_SEARCH_SYSTEM` — never from model memory. `?q=` asks right away; `?mode=help` answers about Accessly from `ACCESSLY_FACTS`.
7. ✅ Quick start (describe what you want → AI picks the destination → confirm → go). Destinations, link building and keyword fallback in `lib/start.js`.
8. Real verified UMass spaces in seed data; deploy to Vultr (add VM IP to Atlas Network Access). For now `npm run seed:examples` (`scripts/seed-examples.mjs`) loads 8 FICTIONAL UMass-flavored spaces + 10 upcoming events for the demo (no "EXAMPLE" in names, by Maria's choice; flagged `example: true` in the DB); re-running replaces them and writes organizer keys to the gitignored `example-organizer-keys.txt`. Never give example places real building names.
9. Stretch: Atlas Vector Search across events/spaces for Ally ("quiet events with step-free access").

**Demo flow (must always work):** Home → Quick start ("Find an accessible event this week" → confirm → Explore) → Profile (pick needs) → Explore → event page shows "matches your needs" → ask an unconfirmed question → anonymous request (prefilled) → Organizer tab: Awaiting → Respond → Confirmed → Profile → My requests shows Confirmed + reply. Also: attendee sends a chat question ("Is there parking nearby?") → Organizer Chats (1) → reply → attendee sees it in My chats. Then Home → Go somewhere → Ally answers the bus question with sources.

**Leave time at the end** for the Devpost write-up and a recorded backup demo video (Wi-Fi/Gemini can fail during judging).
