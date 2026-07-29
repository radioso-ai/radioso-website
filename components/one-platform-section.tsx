import {
  Headset,
  ShoppingCart,
  UserSearch,
  FileSearch,
  LifeBuoy,
  Workflow,
  ArrowDown,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { SparkMark } from '@/components/pixel-sprite'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

// The junk drawer: five agents, five vendors, deliberately mismatched and
// tilted so the cluster reads as procurement clutter rather than a system.
const VENDORS: { icon: Icon; label: string; rotate: string }[] = [
  { icon: Headset, label: 'Support bot · Vendor A', rotate: 'rotate-[-2deg]' },
  { icon: ShoppingCart, label: 'Cart recovery · Vendor B', rotate: 'rotate-[1.5deg]' },
  { icon: UserSearch, label: 'Lead qualification · Vendor C', rotate: 'rotate-[-1deg]' },
  { icon: FileSearch, label: 'Docs assistant · Vendor D', rotate: 'rotate-[2deg]' },
  { icon: LifeBuoy, label: 'Internal helpdesk · Vendor E', rotate: 'rotate-[-1.5deg]' },
]

// What Radioso collapses the drawer into: content once, rules once, an agent
// per surface, one thing to review.
const CHIPS = [
  'one knowledge base',
  'your rules, set once',
  'an agent per surface',
  'one deployment to review',
]

export function OnePlatformSection() {
  return (
    <section id="one-platform" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
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

      <p className="mx-auto mt-10 max-w-xl text-center font-serif text-lg italic text-muted-foreground">
        Same engine underneath — a different agent on every surface.
      </p>
    </section>
  )
}

function VendorCluster() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {VENDORS.map(({ icon: Icon, label, rotate }) => (
          <span
            key={label}
            className={`inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[13px] font-medium text-muted-foreground ${rotate}`}
          >
            <Icon className="size-3.5 text-muted-foreground/70" />
            {label}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        five contracts · five integrations · five copies of your knowledge
      </p>
    </div>
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
