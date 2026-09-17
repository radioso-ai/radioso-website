import Link from 'next/link'
import { Check, ArrowRight, Github, Info } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import { PixelSprite, PLAN_SPRITES } from '@/components/pixel-sprite'
import { Button } from '@/components/ui/button'
import { CLOUD_PLANS, SELF_HOSTED, STAR } from '@/lib/pricing'
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
              {plan.priceAlt && (
                <p className="mt-1 text-2xs text-muted-foreground/80">{plan.priceAlt}</p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{plan.pitch}</p>

            <ul className="flex flex-1 flex-col gap-2.5">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  {plan.conversations}
                  {/* The definition lives in the details below; the icon is the
                      pointer. A link, not a tooltip: the definition is a table
                      and hover has no home on a phone. Negative margin keeps the
                      hit area comfortable without pushing the text apart. */}
                  <a
                    href="#what-counts"
                    aria-label="What counts as a conversation"
                    className="-my-1 -mr-1 inline-flex rounded-sm p-1 align-middle text-muted-foreground/70 hover:text-primary focus-visible:text-primary"
                  >
                    <Info aria-hidden className="size-3.5" />
                  </a>
                </span>
              </li>
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

      {/* Star: the ladder's next rung, with the same anatomy as the Own Galaxy
          band below (name, label, one line, one action) but slimmer, because
          there is no price and no feature list to show. Not a fourth card. */}
      <Reveal
        delay={300}
        className="surface mt-4 flex flex-col gap-4 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7"
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <PixelSprite
            {...PLAN_SPRITES[STAR.sprite]}
            className="size-12 shrink-0"
            title={`${STAR.name} plan`}
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
            <div className="flex shrink-0 items-baseline gap-2">
              <p className="display-serif font-serif text-lg font-semibold text-foreground">{STAR.name}</p>
              <span className="text-2xs italic text-muted-foreground">{STAR.label}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{STAR.text}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
          <Link href={STAR.href}>
            {STAR.cta} <ArrowRight className="size-4" />
          </Link>
        </Button>
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
