import Link from 'next/link'
import {
  Code2,
  Headset,
  BookOpenCheck,
  ArrowRight,
  Check,
  ShoppingCart,
  UserSearch,
  FileSearch,
  LifeBuoy,
  Workflow,
  ArrowDown,
} from 'lucide-react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { TraceOnView } from '@/components/trace-on-view'
import { SparkMark } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

// The junk drawer: five agents, five vendors, deliberately mismatched and
// tilted so the cluster reads as procurement clutter rather than a system.
//
// Each chip is split in two on purpose. The capability is what the reader still
// needs and keeps — it stays plainly legible. The vendor is the only part the
// argument retires, and it is the only part that gets struck through.
const VENDORS: { icon: Icon; capability: string; vendor: string; rotate: string }[] = [
  { icon: Headset, capability: 'Support bot', vendor: 'Vendor A', rotate: 'rotate-[-2deg]' },
  { icon: ShoppingCart, capability: 'Cart recovery', vendor: 'Vendor B', rotate: 'rotate-[1.5deg]' },
  {
    icon: UserSearch,
    capability: 'Lead qualification',
    vendor: 'Vendor C',
    rotate: 'rotate-[-1deg]',
  },
  { icon: FileSearch, capability: 'Docs assistant', vendor: 'Vendor D', rotate: 'rotate-[2deg]' },
  {
    icon: LifeBuoy,
    capability: 'Internal helpdesk',
    vendor: 'Vendor E',
    rotate: 'rotate-[-1.5deg]',
  },
]

/**
 * How the drawer retires itself, in milliseconds from the cluster scrolling
 * into view. The lead-in lets the section's own <Reveal> settle first, and the
 * step matches the ripple down the diagram's three lanes — long enough that the
 * eye reads each one as a separate "replaced", short enough to stay a beat
 * rather than a wait.
 */
const STRIKE_LEAD = 420
const STRIKE_STEP = 420

// What Radioso collapses the drawer into: content once, rules once, an agent
// per surface, one thing to review.
const CHIPS = [
  'one knowledge base',
  'your rules, set once',
  'an agent per surface',
  'one deployment to review',
]

type Audience = {
  icon: Icon
  eyebrow: string
  title: string
  body: string
  points: string[]
  link: { href: string; label: string }
}

// Three groups, in priority order — each visitor should find their own job in
// the first screenful, then the rest of the page proves the mechanics.
const AUDIENCES: Audience[] = [
  {
    icon: Code2,
    eyebrow: 'Builders',
    title: 'Put an agent in your own product',
    body: 'Give your customers a grounded agent inside your app or site — drop in the website embed and public chat, or wire it in through the REST API, TypeScript SDK, or MCP server. No agent framework to adopt, no low-code canvas to drag boxes on. Bring your own LLM keys and self-host the whole thing.',
    points: [
      'Website embed and public chat',
      'REST API, TypeScript SDK, MCP server',
      'Bring your own keys, self-hosted',
    ],
    link: { href: `${site.docsUrl}/api-reference`, label: 'Read the API docs' },
  },
  {
    icon: Headset,
    eyebrow: 'High-volume CX teams',
    title: 'Resolve routine tickets end to end',
    body: 'Ground the agent in your help center and policies and it clears the routine queue itself — running routines like returns and escalations, honoring your directives every step. When a case is genuinely hard, it hands a person the full transcript with every action attached.',
    points: [
      'Grounded in your help center and policies',
      'Runs routines like returns and escalations',
      'Human handoff with the full transcript',
    ],
    link: { href: '#people', label: 'See a ticket resolved' },
  },
  {
    icon: BookOpenCheck,
    eyebrow: 'Knowledge-base teams',
    title: 'One knowledge base, cited answers everywhere',
    body: 'Ingest and curate your documents once, then let both sides of the house draw from the same grounded source. Your team asks in Slack or web chat; your customers ask through the embed or public chat — same citations, no second copy to keep in sync.',
    points: [
      'Curate documents once, reuse everywhere',
      'Grounded answers with citations',
      'Team in Slack, customers in the embed',
    ],
    link: { href: '/slack', label: 'Radioso for Slack' },
  },
]

/**
 * One argument in one section: the five-vendor junk drawer collapses into a
 * single platform, and the three audience cards are the payoff — who that
 * actually buys something for.
 */
export function AudienceSection() {
  return (
    <section id="who" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--secondary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          One platform, not five vendors.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          A support agent from one vendor, cart recovery from another, lead qualification from a
          third — each with its own contract, its own integration, its own copy of your knowledge
          going quietly stale. Radioso runs them all in one place: your content once, your rules
          once, and a purpose-built agent on every surface.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <VendorCluster />

        <ConnectorArrow />

        <RadiosoCard />
      </div>

      {/* The bridge from the platform argument to the people it pays off for. */}
      <p className="mx-auto mt-10 max-w-xl text-center font-serif text-lg italic text-muted-foreground">
        Different teams, same engine.
      </p>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {AUDIENCES.map(({ icon: Icon, eyebrow, title, body, points, link }, i) => (
          <Reveal
            key={eyebrow}
            delay={i * 100}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">{title}</p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            <ul className="mt-1 flex flex-col gap-1.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[13px] text-foreground/80">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={link.href}
              className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary transition-colors hover:underline"
            >
              {link.label} <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/**
 * The drawer, retiring itself. As the cluster scrolls into view the five vendor
 * names are struck through one after another while the capabilities they
 * provided stay untouched — the reader still needs a support bot, they just
 * don't need five vendors to get one.
 *
 * Struck is the resting state, so the served HTML, a visitor without JS and a
 * reduced-motion visitor all get the finished argument; TraceOnView's `arm`
 * winds it back before the first paint and only plays it once, on scroll. The
 * whole effect is colour and text-decoration (see the vendor block in
 * globals.css), so it cannot move a pixel of layout.
 */
function VendorCluster() {
  return (
    <TraceOnView arm delay={STRIKE_LEAD} className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {VENDORS.map(({ icon: Icon, capability, vendor, rotate }, i) => (
          <span
            key={vendor}
            className={`inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[13px] font-medium text-muted-foreground ${rotate}`}
          >
            <Icon className="size-3.5 text-muted-foreground/70" />
            {/* One flex child, so the gap between icon and label is untouched and
                the two halves sit in ordinary inline text flow. */}
            <span>
              <span className="vendor-capability">{capability}</span>
              {' · '}
              <span
                className="vendor-retired"
                style={{ '--strike-delay': `${i * STRIKE_STEP}ms` } as CSSProperties}
              >
                {vendor}
              </span>
            </span>
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        five contracts · five integrations · five copies of your knowledge
      </p>
    </TraceOnView>
  )
}

// Downward connector — the visual language of the non-tight FlowArrow in
// platform-diagram.tsx (a thin gradient line + ArrowDown).
function ConnectorArrow() {
  return (
    <div className="flex flex-col items-center py-4" aria-hidden>
      <div className="h-9 w-px bg-gradient-to-b from-border to-primary/40" />
      <ArrowDown className="-mt-1 size-4 text-primary/50" />
    </div>
  )
}

function RadiosoCard() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm signal-glow">
            <Workflow className="size-4" />
            Radioso
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {CHIPS.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-full border border-primary/20 bg-card px-3 py-1 text-[12px] font-medium text-foreground/85"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
