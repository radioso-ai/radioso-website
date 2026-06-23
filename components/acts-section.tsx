import Link from 'next/link'
import { Compass, Route, Zap, ArrowRight } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { site } from '@/lib/site'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type Beat = { icon: Icon; verb: string; title: string; body: string }

const BEATS: Beat[] = [
  {
    icon: Compass,
    verb: 'steer',
    title: 'Directives',
    body: 'Standing rules that shape how the agent behaves. "When the customer sounds anxious, slow down and confirm before doing anything." Write it once; the agent applies it whenever it fits, on every surface, in every language. A directive steers — it never acts on its own.',
  },
  {
    icon: Route,
    verb: 'guide',
    title: 'Routines',
    body: 'Multi-step flows the agent runs across turns — a return request, an onboarding check, "collect these three things and file a ticket." Write the steps in plain language, drop in a chip to collect a value, call a tool, or branch. Radioso compiles it and the engine resumes it turn to turn. No canvas. No redeploy. Validate, publish, done.',
  },
  {
    icon: Zap,
    verb: 'act',
    title: 'Act & hand off',
    body: 'When the agent should stop talking and do something, it does: call a tool, fire a webhook when a routine finishes, or hand the conversation to a real person. Every step it takes lands in the same turn trace as the answers — so when it does the wrong thing, you can see why.',
  },
]

export function ActsSection() {
  return (
    <section
      id="acts"
      className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          It does the work, not just the talking.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          A bot that can only talk is a glorified search box. Radioso agents follow the rules you
          set, run the procedures you author, and take real action — then show you exactly why.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
        {BEATS.map(({ icon: Icon, verb, title, body }, i) => (
          <Reveal
            key={title}
            delay={i * 120}
            className="lift group flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-5 shadow-sm"
          >
            <div className="flex items-baseline gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-4" />
              </div>
              <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
              <span className="text-[11px] italic text-muted-foreground">{verb}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={`${site.docsUrl}/why-radioso/capabilities`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
        >
          See everything an agent can do <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
