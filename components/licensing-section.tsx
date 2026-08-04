import Link from 'next/link'
import { Github, Building2, ArrowRight } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { SparkMark } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type Plan = {
  icon: Icon
  label: string
  title: string
  body: string
  cta: string
  href: string
}

const PLANS: Plan[] = [
  {
    icon: Github,
    label: 'self-hosted',
    title: 'Open source',
    body: 'Every product feature is open source — grounded answers, directives, routines, actions, every surface. Nothing is feature-gated, nothing is held back for a paid tier. Read the source, run the whole platform on your own infrastructure, and change what you need to.',
    cta: 'Get the source',
    href: site.githubUrl,
  },
  {
    icon: Building2,
    label: 'at scale',
    title: 'Enterprise Edition',
    body: 'For running Radioso across many workspaces and tenants at scale — multi-tenant, scaled deployments where one install serves a lot of people. Tell us what your deployment needs and we will figure out the shape of it together.',
    cta: 'Contact us',
    href: `mailto:${site.contactEmail}`,
  },
]

export function LicensingSection() {
  return (
    <section id="licensing" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--secondary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Every feature, open source.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Every product feature is open source, and you can run the whole platform yourself.
          Enterprise Edition is only for multi-tenant deployments running Radioso at scale.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
        {PLANS.map(({ icon: Icon, label, title, body, cta, href }, i) => (
          <Reveal
            key={title}
            delay={i * 120}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-baseline gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-4" />
              </div>
              <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
              <span className="text-[11px] italic text-muted-foreground">{label}</span>
            </div>
            <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
            >
              {cta} <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
