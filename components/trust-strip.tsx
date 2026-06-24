import { Server, KeyRound, Database, Plug } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'

type Point = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  note: string
}

const points: Point[] = [
  { icon: Server, title: 'Self-hosted', note: 'Runs on your own infrastructure' },
  { icon: KeyRound, title: 'Bring your own LLM', note: 'Your keys, no inference markup' },
  { icon: Database, title: 'Your data stays put', note: 'Everything in your Postgres' },
  { icon: Plug, title: 'Open standards', note: 'MCP, REST, and SDK included' },
]

export function TrustStrip() {
  return (
    <section aria-label="Why teams self-host Radioso" className="pixel-grid border-y border-border/60 bg-card/50">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-10 gap-y-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {points.map(({ icon: Icon, title, note }, i) => (
          <Reveal key={title} delay={i * 90} className="group flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/15">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
              <p className="text-[13px] leading-snug text-muted-foreground">{note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
