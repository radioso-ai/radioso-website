import Link from 'next/link'
import { Check, ArrowRight, Github } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import { PixelSprite, PLAN_SPRITES } from '@/components/pixel-sprite'
import { Button } from '@/components/ui/button'
import { ABOVE_PLANET, CLOUD_PLANS, SELF_HOSTED, TOP_UP } from '@/lib/pricing'
import { cn } from '@/lib/utils'

/**
 * The three cloud plans in a row, with the self-hosted tier as a full-width band
 * beneath them. The layout is the argument: cloud is the decision being made,
 * self-host is present and honoured without competing for it.
 */
export function PricingPlans() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {CLOUD_PLANS.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 120}
            className={cn(
              'flex flex-col gap-5 rounded-2xl p-6 sm:p-7',
              // `.panel` is the design system's "the one thing that matters"
              // accent card — exactly one plan may use it.
              plan.featured ? 'panel' : 'surface',
            )}
          >
            <div>
              <PixelSprite
                {...PLAN_SPRITES[plan.sprite]}
                className="mb-4 size-16"
                title={`${plan.name} plan`}
              />
              <div className="flex items-baseline gap-2">
                <p className="display-serif font-serif text-lg font-semibold text-foreground">
                  {plan.name}
                </p>
                <span className="text-2xs italic text-muted-foreground">{plan.label}</span>
              </div>
              <p className="mt-4 display-serif font-serif text-3xl font-bold tracking-tight text-foreground">
                {plan.price}
              </p>
              <p className="mt-1.5 text-2xs text-muted-foreground">{plan.priceNote}</p>
              {plan.annualNote && (
                <p className="mt-1 text-2xs text-muted-foreground/80">{plan.annualNote}</p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{plan.pitch}</p>

            <ul className="flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant={plan.featured ? 'default' : 'outline'} className="w-full">
              <Link href={plan.cta.href}>
                {plan.cta.text} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        ))}
      </div>

      {/* Two sentences, deliberately not cards: a top-up is a safety valve, not a
          plan, and the ceiling on self-serve is a conversation, not a checkout. */}
      <Reveal delay={300} className="mt-5 flex flex-col items-center gap-1.5 text-center text-sm text-muted-foreground">
        <p>
          Need more this month on any plan?{' '}
          <span className="font-medium text-foreground">
            {TOP_UP.price} for {TOP_UP.conversations} more conversations.
          </span>{' '}
          {TOP_UP.note}
        </p>
        <p>
          {ABOVE_PLANET.text}{' '}
          <a href={ABOVE_PLANET.href} className="font-medium text-primary underline-offset-4 hover:underline">
            {ABOVE_PLANET.cta}
          </a>
        </p>
      </Reveal>

      <Reveal delay={360} className="surface mt-8 rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div>
            <PixelSprite
              {...PLAN_SPRITES[SELF_HOSTED.sprite]}
              className="mb-4 size-16"
              title={`${SELF_HOSTED.name} plan`}
            />
            <div className="flex items-baseline gap-2">
              <p className="display-serif font-serif text-lg font-semibold text-foreground">
                {SELF_HOSTED.name}
              </p>
              <span className="text-2xs italic text-muted-foreground">{SELF_HOSTED.label}</span>
            </div>
            <p className="display-serif mt-2 font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {SELF_HOSTED.title}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{SELF_HOSTED.body}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {SELF_HOSTED.boundary}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            {SELF_HOSTED.ctas.map((cta, i) => (
              <Button key={cta.href} asChild variant="outline" className="w-full">
                <Link href={cta.href}>
                  {i === 0 ? <Github className="size-4" /> : null}
                  {cta.text}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  )
}
