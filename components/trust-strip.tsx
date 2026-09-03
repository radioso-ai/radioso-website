import { Github, KeyRound, Database, Server } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'

type Point = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  note: string
}

// Ownership facts that hold in both deployment modes — the old set (self-hosted,
// Postgres, open standards) only made sense to a visitor who had already decided
// to run it themselves.
const points: Point[] = [
  { icon: Github, title: 'Every feature open source', note: 'Nothing gated behind a paid tier' },
  { icon: KeyRound, title: 'Bring your own LLM', note: 'Your keys, no inference markup' },
  { icon: Database, title: 'Your data stays yours', note: 'Postgres you can export — or host' },
  { icon: Server, title: 'Cloud or self-hosted', note: 'Same platform, your call' },
]

export function TrustStrip() {
  return (
    <section aria-label="Why teams choose Radioso" className="border-y border-border/60 bg-card/50">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-10 gap-y-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {points.map(({ icon: Icon, title, note }, i) => (
          <Reveal key={title} delay={i * 90} className="group flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-110 group-hover:bg-primary/20">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
              <p className="text-[15px] leading-snug text-muted-foreground">{note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
