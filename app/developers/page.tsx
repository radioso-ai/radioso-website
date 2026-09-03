import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Code2,
  Database,
  Github,
  Globe2,
  Terminal,
  Workflow,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { PageShell } from '@/components/page-shell'
import { PlatformDiagram } from '@/components/platform-diagram'
import { Quickstart } from '@/components/quickstart'
import { Reveal } from '@/components/reveal'
import { SignalMark } from '@/components/pixel-sprite'
import { TrustStrip } from '@/components/trust-strip'
import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Developers',
  description:
    'Build on Radioso with the REST API, TypeScript SDK, website embed, and MCP server. Run in Radioso Cloud or self-host the open-source platform.',
  alternates: { canonical: `${site.url}/developers` },
}

type Interface = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  name: string
  label: string
  description: string
}

const INTERFACES: Interface[] = [
  {
    icon: Globe2,
    name: 'Website embed',
    label: 'one script tag',
    description:
      'Put a hosted conversation in your product or marketing site. Origin policy, appearance, and the agent behind it stay under your control.',
  },
  {
    icon: Code2,
    name: 'REST API',
    label: 'plain HTTP',
    description:
      'Drive conversations and product workflows from any stack without adopting a framework-specific runtime.',
  },
  {
    icon: Boxes,
    name: 'TypeScript SDK',
    label: 'typed client',
    description:
      'Use the same API with types and first-class primitives for applications already built in TypeScript.',
  },
  {
    icon: Terminal,
    name: 'MCP server',
    label: '@radioso/mcp-server',
    description:
      'Expose agent conversations and workspace documents to MCP clients, with the same retrieval, rules, and citations attached.',
  },
]

export default function DevelopersPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_35%,color-mix(in_oklab,var(--signal)_12%,transparent),transparent_32%)]"
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:py-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <SignalMark color="currentColor" />
              Developer platform
            </div>
            <h1 className="display-serif mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The full agent stack, already assembled.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Grounding, rules, tools, routines, actions, and every conversation surface run on
              one open-source platform. Build the agent your product needs instead of rebuilding
              its infrastructure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#quickstart">
                  Run it locally <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={site.docsUrl}>
                  Read the docs <BookOpen className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <RuntimeMap />
        </div>
      </section>

      <TrustStrip />

      <Reveal>
        <PlatformDiagram />
      </Reveal>

      <Reveal>
        <InterfacesSection />
      </Reveal>

      <Reveal>
        <Quickstart />
      </Reveal>

      <Reveal>
        <DeveloperCta />
      </Reveal>
    </PageShell>
  )
}

function RuntimeMap() {
  return (
    <div className="panel rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            one deployment
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Same agent, every surface</p>
        </div>
        <Workflow className="size-5 text-primary" />
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-center text-sm font-medium text-foreground">
        Knowledge <span className="text-muted-foreground/60">+</span> directives{' '}
        <span className="text-muted-foreground/60">+</span> routines
      </div>
      <div aria-hidden className="mx-auto h-5 w-px bg-border" />
      <div className="signal-glow mx-auto w-fit rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
        Radioso runtime
      </div>
      <div aria-hidden className="mx-auto h-5 w-px bg-border" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {['Web', 'API', 'SDK', 'MCP'].map((surface) => (
          <div
            key={surface}
            className="rounded-xl border border-border/60 bg-card px-3 py-2 text-center font-mono text-xs font-medium text-foreground/80"
          >
            {surface}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-2xs text-muted-foreground">
        Context in once. The answer returns where it was asked.
      </p>
    </div>
  )
}

function InterfacesSection() {
  return (
    <section id="interfaces" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="max-w-md">
          <SignalMark className="mb-4" color="var(--primary)" />
          <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            One agent. Use it anywhere.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Every interface reaches the same runtime and knowledge. Add a ready-made surface or
            build your own without creating another copy of the agent behind it.
          </p>
          <Link
            href={`${site.docsUrl}/api-reference`}
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Browse the API reference <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="surface divide-y divide-border/70 overflow-hidden rounded-2xl">
          {INTERFACES.map(({ icon: Icon, name, label, description }) => (
            <div key={name} className="grid gap-3 p-5 sm:grid-cols-[2.75rem_1fr] sm:p-6">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="display-serif font-serif text-lg font-semibold text-foreground">
                    {name}
                  </h3>
                  <span className="font-mono text-2xs text-muted-foreground">{label}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeveloperCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="panel rounded-2xl px-6 py-14 text-center sm:px-10">
        <Database className="mx-auto size-6 text-primary" />
        <h2 className="display-serif mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Start with a working platform, then make it yours.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Run Radioso locally, inspect the source, and follow the docs from your first document to
          an agent in production.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={site.docsUrl}>
              Read the docs <BookOpen className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={site.githubUrl}>
              View on GitHub <Github className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
