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
