# Design System — Radioso Website

This document is the source of truth for visual and editorial decisions on the Radioso marketing site. Read it before changing UI, copy, or motion. Extend the system deliberately; do not introduce one-off treatments when an existing token or recipe will do.

## Product context

- **What this is:** The marketing and developer website for Radioso, an open-source platform for grounded conversational agents that can answer, act, follow rules, run routines, and hand off to people.
- **Who it is for:** Product leaders, customer-experience teams, knowledge teams, and engineers evaluating or implementing Radioso.
- **Project type:** A brand-led marketing site with editorial content and technical product demonstrations.
- **Primary goal:** Make Radioso feel credible, distinct, understandable, and runnable without turning the site into a generic SaaS template or a dense documentation portal.

## Aesthetic direction

- **Direction:** Editorial signal system.
- **Decoration level:** Intentional. Typography, whitespace, diagrams, and the Radioso signal language carry the design; decoration never fills space for its own sake.
- **Mood:** Calm, capable, open, and technically rigorous. The site should feel human enough for buyers and exact enough for engineers.
- **Composition:** Use expressive serif headlines against disciplined grids. The deep-blue opening and closing surfaces bookend a warm, quiet page. The dark “Inside Radioso” chamber is the single focused view into the machine.
- **Avoid:** Generic SaaS gradients, decorative sparkles or blobs, ornamental icons, repetitive three-card feature grids, uniform card mosaics, and sections that repeat the same claim in different words.

## Typography

### Families

- **Display and hero:** Fraunces variable, normal and true italic. Use for primary headings, high-value statements, and occasional editorial pull quotes. Apply optical sizing through `.display-serif`.
- **Body and UI:** IBM Plex Sans at 400, 500, 600, and 700. Use for paragraphs, navigation, buttons, labels, and controls.
- **Code and technical identifiers:** JetBrains Mono. Reserve it for commands, URLs, API or protocol identifiers, trace data, and compact architecture labels. Do not use it merely to make an eyebrow look technical.
- **Loading:** Use `next/font` so all three families are optimized and self-hosted by the built site.

### Scale

Use the Tailwind type scale already configured by the project:

- `text-2xs`: 11px — citation pips and genuinely constrained micro-labels only
- `text-xs`: 12px — metadata and compact technical labels
- `text-sm`: 14px — UI, secondary copy, and card copy
- `text-base`: 16px — default body copy
- `text-lg`: 18px — card titles and editorial accents
- `text-2xl`: 24px — tertiary display headings
- `text-3xl`: 30px — section headings on small screens
- `text-4xl`: 36px — section headings on larger screens and compact page heroes
- `text-5xl`: 48px — large page heroes
- `text-6xl`: 60px — developer and editorial hero maximum

### Rules

- Use sentence case. Never force text to uppercase. Keep established acronyms such as API, SDK, MCP, REST, FAQ, and LLM capitalized normally.
- Do not add letter spacing to lowercase prose or labels. Tight tracking is reserved for large display headings; monospaced identifiers may use their natural spacing.
- Use Fraunces sparingly enough that it remains expressive. Body copy and functional headings should remain in IBM Plex Sans where readability or utility matters more than voice.
- Prefer real italic faces over synthetic obliques.
- Keep body copy at 16px when it carries a section’s main explanation. Keep line length near 45–75 characters.
- Balance display headings and use comfortable body line height, generally 1.5–1.7.
- Typography should create hierarchy before borders, shadows, or color are added.

## Color

The palette is defined in `app/globals.css` using OKLCH. Those variables are authoritative.

### Core palette

- **Canvas:** `--background: oklch(98.16% 0.0026 106.45)` — warm near-white page ground
- **Ink:** `--foreground: oklch(23.83% 0.0308 149.85)` — deep green-black rather than neutral black
- **Card:** `--card: oklch(100% 0 106.45)` — crisp content surface
- **Interactive blue:** `--primary: oklch(54.06% 0.1395 253.17)` — links, buttons, focus, and readable interactive emphasis
- **Signal blue:** `--signal: oklch(66.43% 0.1404 253.56)` — traces, glows, washes, and other non-text atmosphere
- **Human yellow:** `--human: oklch(85.62% 0.1694 87.18)` — moments where a person enters the loop
- **Muted ink:** `--muted-foreground: oklch(53.84% 0.0106 150.55)` — secondary copy
- **Border:** `--border: oklch(87.8% 0.0069 145.52)` — quiet structure
- **Destructive:** `--destructive: oklch(54.58% 0.1769 29.39)` — errors and destructive actions only

### Named surfaces

- **Hero and closing bookend:** `oklch(33% 0.093 253)` in light mode and `oklch(23% 0.072 253)` in dark mode. The opening hero, final CTA, and footer use this family to frame the page.
- **Machine chamber:** A dark green-black surface with locally rescoped semantic tokens. Reserve it for “Inside Radioso” architecture content.
- **White content sections:** Use for buyer explanations, licensing, FAQ, and editorial content. Do not make the entire lower half blue.

### Rules

- Blue means the machine is acting. Yellow means a person is being asked or involved.
- Use `--primary` for readable text and controls. Use brighter `--signal` only for decorative light and motion.
- Brand-color opacity follows the fixed ladder: 5% wash, 10% tint, 20% line, 35% edge, 50% veil, and 70% glow.
- Do not introduce arbitrary blue opacities or nearby one-off colors.
- Do not use yellow for text on the cream background; it does not have sufficient contrast.
- Dark mode is a surface redesign, not a mechanical inversion. Use off-white text, visible elevation, and the dark token set.
- Success and warning colors are not part of the current marketing palette. If product states require them, add named semantic tokens before using them; do not add raw green or orange values in components.

## Spacing

- **Base unit:** 4px.
- **Density:** Spacious for marketing composition; compact only inside technical diagrams and controls.
- **Common scale:** 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, and 112px.
- **Page gutter:** 24px (`px-6`) for primary content; the navigation may use 16px on the smallest screens.
- **Section rhythm:** Most primary sections use 96px vertical space and 112px from the small breakpoint upward (`py-24 sm:py-28`). Compact editorial or utility pages may use 48–64px.
- Keep related elements close and separate distinct ideas generously. Do not use empty space to compensate for weak or redundant content.

## Layout

- **Approach:** Hybrid editorial. Use disciplined grids for product information and asymmetry or strong type scale for emphasis.
- **Primary content width:** 1152px (`max-w-6xl`). Selected hero and demonstration compositions may extend to 1280px (`max-w-7xl`).
- **Reading width:** Use `max-w-2xl` or `max-w-3xl` for prose and centered introductions.
- **Breakpoints:** Design mobile-first, then use Tailwind’s `sm`, `md`, `lg`, and `xl` breakpoints. Do not merely stack desktop columns; preserve the intended reading order and focal point.
- **Full-width bands:** Hero, machine chamber, trust strip, closing CTA, and footer may span the viewport. Their content still aligns to the shared grid.
- **One job per section:** Each section gets one clear claim, one short explanation when needed, and one primary visual or action.
- **Homepage scope:** Keep buyer value, a simplified “Inside Radioso” view, licensing, and FAQ.
- **Developer scope:** Keep quickstart, detailed architecture, interfaces, API/SDK/MCP material, and clear routes into documentation. Provider and deployment detail belongs in the docs when repeating it would not add value.

## Surfaces and shape

Use the shared recipes in `app/globals.css`:

- **`.surface`:** Resting content container with a quiet border and minimal elevation.
- **`.panel`:** Signal-tinted emphasis for the single important object in a section.
- **`.interactive`:** A surface that earns hover lift because the whole object is interactive.

Shape hierarchy:

- 4–8px radii for buttons and small controls
- 12px (`rounded-xl`) for nested panels and icon tiles
- 16px (`rounded-2xl`) for primary cards and large containers
- Full pills only for navigation, chips, tabs, and compact status/control objects

Cards must earn their border. Prefer composition, spacing, or a simple rule when grouping alone is sufficient. Avoid wrapping every paragraph in a card.

## Icons and visual language

- Use Lucide icons at a restrained 16–20px size for functional meaning.
- Small blue-tint icon tiles may identify list items or capabilities. They are not general heading decoration.
- Use the pixel-grid `SignalMark` as the recurring section marker. Blue marks machine-oriented sections; yellow marks people-oriented sections.
- Do not use sparkles. Do not introduce unrelated illustration styles or emoji as decoration.
- Diagrams should explain actual product structure. Remove captions that merely restate what the diagram already shows.
- Keep connector lines, trace motion, and small signal glows subordinate to the information.

## Motion

- **Approach:** Intentional and explanatory. Motion should reveal hierarchy, demonstrate a conversation or system flow, or confirm interaction.
- **Fast:** `--dur-fast: 180ms` for color, opacity, and small state changes.
- **Base:** `--dur-base: 420ms` for lifts, reveals, and meaningful movement.
- **Slow:** `--dur-slow: 900ms` for deliberate, once-per-view entrances.
- **House easing:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- **Spring easing:** `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` for small pops only.
- Animate transforms and opacity whenever possible. Do not animate layout dimensions unless the interaction genuinely depends on them.
- Avoid `transition: all`; name the properties being animated.
- Every motion treatment must provide a stable no-JavaScript state and respect `prefers-reduced-motion`.

## Content and voice

- Be direct, specific, and grounded in what Radioso actually does.
- Prefer product evidence over abstract claims. If copy could describe any AI product, rewrite or remove it.
- Remove truisms and captions that repeat the headline or adjacent diagram.
- Use active voice and concrete verbs: answer, cite, act, ask, hand off, run, inspect, deploy.
- Keep technical depth on `/developers` and in the documentation; keep the homepage legible to buyers.
- Use sentence case for headings, labels, navigation, buttons, and metadata. Do not use all caps as a visual device.
- Preserve correct names and acronyms. Do not lowercase API, SDK, MCP, REST, FAQ, LLM, GitHub, TypeScript, Postgres, or Docker.
- Buttons name the action: “Run it locally,” “Read the docs,” or “Start in the cloud.” Avoid vague labels such as “Learn more” when a specific action exists.

## Accessibility and quality

- Body text must meet WCAG AA contrast. Large display text and UI boundaries must meet their relevant contrast thresholds.
- Keep visible `focus-visible` treatment on every interactive element.
- Target 44px controls for primary mobile actions. Smaller utility controls must remain comfortably selectable and have an accessible name.
- Do not encode meaning with color alone; pair blue/yellow states with labels, icons, or structure.
- Prevent horizontal overflow at 375px and verify layouts at mobile, tablet, desktop, and wide desktop widths.
- Respect theme choice, reduced motion, semantic heading order, and meaningful link/button labels.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-09-03 | Established the editorial signal system as the site standard | Codifies the system already present in the rendered site and shared CSS tokens. |
| 2026-09-03 | Standardized on Fraunces, IBM Plex Sans, and JetBrains Mono | Separates expressive brand voice, readable UI, and genuinely technical content without generic SaaS typography. |
| 2026-09-03 | Prohibited forced uppercase | Sentence case fits the calm editorial voice and avoids decorative label styling. |
| 2026-09-03 | Assigned blue to machine action and yellow to human involvement | Gives brand color a consistent semantic role. |
| 2026-09-03 | Kept the homepage technically credible but moved implementation detail to `/developers` | Preserves buyer clarity while giving engineers a focused path. |
| 2026-09-03 | Bookended the site with the same deep-blue family | Creates symmetry without making the entire lower half visually heavy. |
| 2026-09-21 | Made the agent demos a pinned, scroll-scrubbed section rather than a timed sequence | Scrolling past the section is now watching it: the stage sticks below the nav, scroll position drives the conversation, and scrolling back rewinds it until the scene has played through once; a finished conversation stays finished. Timing tokens still set the shape of each beat; scroll only sets where on the timeline we are. |
| 2026-09-21 | Demo card takes two thirds of the row, the rail one third | The transcript is the evidence; the rail is its caption. A half-and-half split made them compete. |
| 2026-09-21 | Allowed a fixed-height chat card that clips and scrolls its transcript | The demo card is the one place on the site that behaves like a product surface rather than a page surface. Everywhere else, content still sets its own height. |
| 2026-09-21 | A finished demo hands its card to the visitor | While the scene is being scrubbed the card is `overflow: hidden`, so a wheel over it cannot steal the page scroll and break the pin. Once the conversation has played out it becomes a real scroll container, and the transcript is readable at the visitor's pace. |
| 2026-10-01 | Demo tabs name jobs, each tab ends in an exit, and a fourth tab shows agents as customers in a scroll-scrubbed diagram | Tabs read as outcomes (resolve tickets, answer from your help center, qualify leads, serve your customers’ agents) rather than agent types. Each story ends in the action it earns: start in the cloud, the copyable embed tag, the live talk-to-the-team routine, the publishing guide. The MCP tab draws, in the direction the request travels, the assistant clients, the way the conversation arrives (agent card, MCP server) and your agent with its loop (directives, citations, routines, skills, handoff), on the same scroll clock as the transcripts. The channel drops a trace into the framed exchange below it, and a dashed link ties the agent card to your agent because it lives on your domain. The agent sits at the centre and grounding is one lane of five, because MCP is how the request arrives, not what Radioso is. It rests lit, so no JS and reduced motion get the finished picture, and it fits the fixed card without scrolling. Third-party assistants are text labels with one generic glyph, never their logos. Discovery comes before the channel: the assistant reads the agent card your domain serves at `/.well-known`, then walks in over MCP. That is the shipped mechanism (publishing an agent, guides/publish-an-agent). The tab does not mention `llms.txt`, which Radioso does not generate, or per-client credentials, which belong to the separate shared MCP endpoint. On a phone the exit sits just past the pinned track, because the stage has no room for it. |
| 2026-10-01 | The hero's “Ask Radioso” card is chips first, opens on a handoff, and its badge only claims “live” once it is | Nobody typed into the blank input, and opening on “What is Radioso?” had the product describing itself. The seed exchange is now “How does Radioso hand off to a person?” with the production agent’s verbatim, cited answer. Four chips sit directly under the answer as a two-column grid of 14px pills (stacked on phones): actions, what happens when Radioso can’t answer, self-hosting, and the talk-to-the-team routine. Free text hides behind an “Ask your own question” link and stays open once anything has been asked. The header badge reads “from the docs” (muted, no dot) over the canned seed, “live” with the pulse once the API has answered a visitor, and “demo” when the stub served. |
| 2026-10-01 | The live agent moves to a chat launcher on every page, and the hero shows the product in context | The hero's chat card asked visitors to read a marketing card as a chat. The live agent is now a support widget in the corner of every page: a 56px hero-navy button with the logo mark, lifted clear of the cookie strip while it shows (`--cookie-strip-h`), opening a 380×560 window (a full-screen sheet on phones) whose input never leaves the bottom edge. The agent speaks first with a canned greeting and three quick replies plus the talk-to-the-team chip, which go away after the first ask. Anything that calls `ask()` (FAQ, the leads tab's exit) opens it; it stays open across pages for the session. The hero's right column is a browser window on Acme's billing page, abstract except for “Acme” and “Billing”, with the Radioso widget open in its corner playing a shortened cut of the support ticket on a timer (`TimedScene`): it plays once from mount and holds the close, the handoff to Jonas and the $312. Reduced motion and no JS get that finished frame. Below `lg` the frame drops and the widget stands alone under the calls to action. |
| 2026-10-01 | The hero is the claim alone, and the pinned demo section is its visual | The browser-frame vignette replayed the first demo tab a screen above the tab itself. It is gone, along with `TimedScene` and the widget variant of the scene card. The hero is now headline, subhead and calls to action, centred and full width; the headline steps up to `text-5xl` at `lg` and breaks only at the comma if it wraps. Its bottom padding and the demo section's top padding are tightened (hero `pb-10 sm:pb-12`, demos `pt-10 sm:pt-12`) so at 1440×900 the demo heading and tab bar sit in the first viewport under the calls to action and the pin engages within the first scroll (about 390px). The demo heading drops a step to `text-2xl sm:text-3xl` and loses its `SignalMark`, so it reads as the label on the tabs rather than a second headline. Claim, then tabs. |
| 2026-10-01 | The hero's primary action is the logo yellow with ink text | A deliberate exception to “the primary inverts to the ink colour on the band”. On the navy band the yellow “Start in the cloud” (with a trailing arrow) is the brightest object after the headline, and the logo yellow is already the band's light source. It uses the `secondary`/`secondary-foreground` token pair, so the ink stays dark in both themes. This is the only yellow button on the site: everywhere else the primary stays `--primary`, and yellow still never carries text on cream. The secondary “Run it locally” is a hairline outline with a small mono “5 min” tag inside it. Above the headline sits one eyebrow pill (yellow dot, “Open source · priced per conversation”) on a 35% yellow hairline. |
| 2026-10-01 | The demo card straddles the hero band | The navy backdrop runs past the hero by `--demo-lead` (the demo section's top padding) plus `--demo-straddle` (5.5rem, 10rem from `lg`), so the card's top half sits on navy and the rest on the page. The card is opaque and later in the tree, so it paints over the overhang, and once the stage pins at 96px the band scrolls away behind it. The pin maths are untouched: the track starts after the lead-in and measures itself. Hero deep links target anchors 96px above the track, so they land with the stage pinned at the start of its run. The standalone heading “What your agents handle.” is gone; the label in the card replaces it. |
| 2026-10-01 | The demo is one card with a vertical tab rail | Left column (one part in 3.3) on a muted ground: “See it work”, the four tabs as rows (active row in a 10% human-yellow fill with a 35% hairline, because the selection is the visitor's hand on the demo), then the rail title, intro, the three synced steps and the tab's exit at the foot. Right column: a thin header strip with the scene label in sentence case, then the scrubbed transcript or the MCP diagram. From `lg` the whole card is the fixed object (`min(100svh − 128px, 680px)`), and only the active step carries its sentence so every tab fits a 900px viewport. The tabpanel spans both columns as a subgrid, so `role="tablist"`/`role="tab"`/`role="tabpanel"` stay intact. Below `lg` the tabs wrap as a pill bar in the card's top section, the rail shows the active step only, and the scene takes the fixed height. |
| 2026-10-01 | Rejected from the designer's hero mock | Four elements of the mock do not ship and should not come back: the uppercase “SEE IT WORK” label (sentence case only), green check marks on action rows (checks stay `--primary`; green is not in the palette), a “Live” label with a green dot over a scripted scene (the transcript is scripted, so claiming “live” is false), and the dot grid on the band (the band carries the signal source and rings only). |
| 2026-10-02 | Removed the hero's ornaments and the demo rail's captions: the demo speaks for itself | The rail described what the chat beside it was already showing. The hero loses the eyebrow pill, the “5 min” tag in “Run it locally” and the second half of the footnote, which is now “No credit card.”; the headline moves up into the pill's place. The demo card's left column is now only “See it work” (desktop), the four tab rows and the tab's exit at the foot, with the empty space above the exit left empty. The rail title, intro, the three synced steps and the note under the leads exit are gone for every tab, along with the step-sync code and the rail-state CSS. On a phone the card is the pill bar and the scene, nothing between. The launcher no longer shows a once-per-visit hint: its “Chat with us” label appears on hover and keyboard focus only. Kept, because they name or are the content rather than describing it: the scene strip's setting label (“A support ticket”), the “Radioso” sender name over bubbles, and the MCP diagram's own captions. With the rail gone the pinned card drops from 680px to `min(100svh − 128px, 600px)`, and the phone scene grows to `min(52vh, 440px)`. This supersedes the eyebrow, “5 min” tag and rail-step details in the three 2026-10-01 rows above. |
