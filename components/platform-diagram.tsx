import {
  Workflow,
  Search,
  Headset,
  Plus,
  Wrench,
  Compass,
  Route,
  Sparkles,
  Quote,
  Database,
  MessageCircle,
  Globe,
  Code2,
  Plug,
  Terminal,
  Boxes,
  ArrowDown,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { SparkMark } from '@/components/pixel-sprite'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type Item = { icon: Icon; name: string; note: string; mono?: boolean }

// Skills act — transient capabilities. retrieval.answer is one of several.
const SKILLS: Item[] = [
  { icon: Search, name: 'retrieval.answer', note: 'ground answers in your docs', mono: true },
  { icon: Plus, name: 'Your own', note: 'register a capability' },
]

// Directives steer — authored standing condition → action rules, matched per turn.
const DIRECTIVES: { name: string }[] = [
  { name: 'confirm before acting' },
  { name: 'stay concise' },
  { name: '+ your rules' },
]

// Routines guide — authored multi-step routines, resumed across turns; can emit actions.
const ROUTINES: Item[] = [
  { icon: Headset, name: 'Contact a human', note: 'collect → confirm → send' },
  { icon: Plus, name: 'Your own', note: 'author a routine' },
]

// Surfaces are the I/O boundary: you ask from one, and the answer returns there.
const SURFACES: { icon: Icon; label: string }[] = [
  { icon: MessageCircle, label: 'Web chat' },
  { icon: Globe, label: 'Public chat' },
  { icon: Code2, label: 'Website embed' },
  { icon: Plug, label: 'REST API' },
  { icon: Boxes, label: 'TypeScript SDK' },
  { icon: Terminal, label: 'MCP server' },
]

export function PlatformDiagram() {
  return (
    <section id="platform" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--primary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Inside Radioso.
        </h2>
      </div>

      <div className="mx-auto mt-14 max-w-4xl">
        <AgentCard />
      </div>

      <FlowArrow />

      <div className="mx-auto max-w-4xl">
        <SurfacesStrip />
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center font-serif text-lg italic text-muted-foreground">
        Talks to your users and takes actions you need. 
      </p>
    </section>
  )
}

function AgentCard() {
  return (
    <div className="relative flex flex-col rounded-2xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-col items-center gap-1">
          <CenterPill icon={Workflow} label="Assistant" emphasis />
          <p className="text-[11px] text-muted-foreground">one turn loop · steer, act, follow through</p>
        </div>

        <BranchDivider />

        <div className="grid gap-3 sm:grid-cols-3">
          <LaneCard icon={Compass} title="Directives" verb="steer">
            <div className="flex flex-col gap-1.5">
              {DIRECTIVES.map((d) => (
                <RulePill key={d.name} label={d.name} />
              ))}
            </div>
            <LaneNote>Standing condition → action rules. Shape behavior, no new capability.</LaneNote>
          </LaneCard>

          <LaneCard icon={Wrench} title="Skills" verb="act">
            <div className="flex flex-col gap-1.5">
              {SKILLS.map((s) => (
                <ItemRow key={s.name} {...s} />
              ))}
            </div>
            <LaneNote icon={Database}>retrieval draws on your docs → Postgres + pgvector</LaneNote>
          </LaneCard>

          <LaneCard icon={Route} title="Routines" verb="guide">
            <div className="flex flex-col gap-1.5">
              {ROUTINES.map((r) => (
                <ItemRow key={r.name} {...r} />
              ))}
            </div>
            <LaneNote>Stateful multi-step routines, resumed across turns.</LaneNote>
          </LaneCard>
        </div>

        <MergeDivider />

        <CenterPill icon={Sparkles} label="LLM" />

        <FlowArrow tight />

        <div className="signal-glow rounded-xl border border-primary/30 bg-card px-4 py-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] font-medium">
            <span className="inline-flex items-center gap-2">
              <Quote className="size-3.5 text-primary" />
              Grounded answer + citations
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground">async actions (outbox)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SurfacesStrip() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SURFACES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[13px] font-medium text-foreground/85 ring-1 ring-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:ring-primary/40"
          >
            <Icon className="size-3.5 text-foreground/70" />
            {label}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Ask from any surface — the answer returns there.
      </p>
    </div>
  )
}

function CenterPill({
  icon: Icon,
  label,
  emphasis = false,
}: {
  icon: Icon
  label: string
  emphasis?: boolean
}) {
  const cls = emphasis
    ? 'bg-primary text-primary-foreground signal-glow'
    : 'bg-card text-foreground border border-border'
  return (
    <div className="flex items-center justify-center">
      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ${cls}`}>
        <Icon className="size-4" />
        {label}
      </div>
    </div>
  )
}

function LaneCard({
  icon: Icon,
  title,
  verb,
  children,
}: {
  icon: Icon
  title: string
  verb: string
  children: React.ReactNode
}) {
  return (
    <div className="lift group flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-3">
      <div className="flex items-baseline gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-3.5" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="text-[11px] italic text-muted-foreground">{verb}</span>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  )
}

function ItemRow({ icon: Icon, name, note, mono }: Item) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className={`truncate text-[12px] font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>
          {name}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}

function RulePill({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-[12px] text-foreground/80">
      {label}
    </div>
  )
}

function LaneNote({ icon: Icon, children }: { icon?: Icon; children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
      {Icon && <Icon className="mt-0.5 size-3 shrink-0" />}
      <span>{children}</span>
    </p>
  )
}

function FlowArrow({ tight = false }: { tight?: boolean }) {
  if (tight) {
    return (
      <div className="flex justify-center">
        <ArrowDown aria-hidden className="size-4 text-border" />
      </div>
    )
  }
  // A connector line carrying a bright signal dot — data flowing toward the surfaces.
  return (
    <div className="flex flex-col items-center py-4" aria-hidden>
      <div
        className="flow-conduit h-9 w-px bg-gradient-to-b from-border to-primary/40"
        style={{ '--flow-distance': '34px' } as React.CSSProperties}
      />
      <ArrowDown className="-mt-1 size-4 text-primary/50" />
    </div>
  )
}

function BranchDivider() {
  return (
    <div aria-hidden className="relative flex h-4 items-start justify-center">
      <div className="absolute top-0 h-4 w-px bg-border" />
      <div className="absolute top-4 left-[12%] right-[12%] h-px bg-border" />
      <div className="absolute top-4 left-[12%] h-3 w-px bg-border" />
      <div className="absolute top-4 right-[12%] h-3 w-px bg-border" />
    </div>
  )
}

function MergeDivider() {
  return (
    <div aria-hidden className="relative flex h-4 items-end justify-center">
      <div className="absolute bottom-0 h-4 w-px bg-border" />
      <div className="absolute bottom-4 left-[12%] right-[12%] h-px bg-border" />
      <div className="absolute bottom-4 left-[12%] h-3 w-px bg-border" />
      <div className="absolute bottom-4 right-[12%] h-3 w-px bg-border" />
    </div>
  )
}
