import Link from 'next/link'
import { Code2, Headset, BookOpenCheck, ArrowRight, Check } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { SparkMark } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
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

export function AudienceSection() {
  return (
    <section id="who" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--primary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Different teams, same engine.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Builders embedding an agent in a product, support teams clearing a ticket queue,
          knowledge-base teams serving both sides of the house — everyone configures an agent with
          their content and their rules, then points it at the right surface.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
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
