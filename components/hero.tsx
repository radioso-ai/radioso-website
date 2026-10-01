import Link from 'next/link'

import { HeroVignette } from '@/components/hero-vignette'
import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

/**
 * The opening band: the claim and the two ways in on the left, and on the right the
 * product where a customer would meet it, an Acme billing page with the Radioso widget
 * open in its corner, resolving a ticket. The live agent itself lives in the chat
 * launcher, on every page.
 */
export function Hero() {
  // The extra top step at `lg` is for the customer-site frame, not the headline. From
  // `lg` the hero is two columns centred against each other and the frame is the taller
  // of the two, so it starts at the very top of the row, landing ~40px under a sticky
  // nav that is itself only 16px off the viewport. Below `lg` the widget sits under the
  // copy and is nowhere near the nav.
  return (
    <section className="hero-band relative isolate pb-16 pt-10 sm:pt-14 lg:pt-20">
      {/* Everything in here emanates from the sun mark in the nav: the source
          glow and the three broadcast waves leaving it. */}
      <div aria-hidden className="hero-backdrop">
        <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
          <div className="signal-origin signal-source" />
          <div className="signal-origin signal-rings">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:max-w-6xl xl:max-w-7xl">
        <div className="grid items-center gap-8 text-center sm:gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14 lg:text-left">
          <div>
            <h1
              className="rise-in font-serif text-balance text-[color:var(--hero-ink)] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl xl:text-[2.375rem]"
              style={{ '--rise-delay': '60ms' } as React.CSSProperties}
            >
              {/* At `lg`+ the headline shares the row with the customer-site frame, and `text-balance`
                  breaks the narrow column mid-sentence ("service, handled" on its own line). The
                  clause after the comma becomes a block there so the break lands on it instead.
                  The type ramp stays gentle (30 / 36 / 38) because the two-column layout caps
                  what fits: a wider step would make some breakpoint render larger than the
                  desktop hero. Below `lg` the headline is full-width and breaks fine on its
                  own — `self-hosted` just needs to stay whole so it can't split at the hyphen. */}
              <span className="lg:block">Customer service,</span>{' '}
              <span className="lg:block">handled by agents you own.</span>
            </h1>

            <p
              className="rise-in mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--hero-ink-muted)] sm:mt-6 sm:text-lg lg:mx-0"
              style={{ '--rise-delay': '160ms' } as React.CSSProperties}
            >
              {/* The category line comes first so the title tag, JSON-LD, and hero all say
                  the same thing. Each named demo deep-links to its tab below — the tab
                  section listens for these #demo-* hashes. */}
              Radioso is the customer service platform for AI agents. Open source, priced per
              conversation, run in our cloud or yours. See it{' '}
              <a href="#demo-support" className="hero-link">resolve a ticket</a>,{' '}
              <a href="#demo-docs" className="hero-link">answer from your help center</a>, and{' '}
              <a href="#demo-leads" className="hero-link">qualify a lead</a>.
            </p>

            <div
              className="rise-in mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start"
              style={{ '--rise-delay': '260ms' } as React.CSSProperties}
            >
              {/* Cloud first, self-host second: the cloud is the commercial path
                  and signup is genuinely self-serve; self-hostability is the proof
                  of ownership, not the headline act. The primary runs a size up
                  from the ghost so the hierarchy is unmistakable. GitHub keeps its
                  spots in the nav and footer. `bg-primary` is the site's blue,
                  invisible on the band, so the primary action inverts to the ink
                  colour and the secondary is a hairline ghost.

                  "Run it locally", not "self-host, in 5 minutes": five minutes is
                  the docker-compose bootstrap on your own machine. Real
                  self-hosting is a deployment project, and a label that
                  overclaims it reads as marketing-true at best. */}
              <Button
                asChild
                className="h-12 px-7 text-base font-semibold bg-[color:var(--hero-ink)] text-[color:var(--hero-bg)] hover:bg-[color:var(--hero-ink)]/90"
              >
                <Link href={site.appUrl}>Start in the cloud</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 text-sm border-[color:var(--hero-ink)]/30 bg-transparent text-[color:var(--hero-ink)] shadow-none hover:bg-[color:var(--hero-ink)]/10 hover:text-[color:var(--hero-ink)] dark:border-[color:var(--hero-ink)]/30 dark:bg-transparent dark:hover:bg-[color:var(--hero-ink)]/10 dark:hover:text-[color:var(--hero-ink)]"
              >
                <Link href="/developers#quickstart">Run it locally in 5 minutes</Link>
              </Button>
            </div>

            <p
              className="rise-in mt-3 text-sm text-[color:var(--hero-ink-muted)]"
              style={{ '--rise-delay': '300ms' } as React.CSSProperties}
            >
              No credit card &mdash; sign up and get straight to work.
            </p>
          </div>

          <div className="min-w-0">
            <HeroVignette />
          </div>
        </div>
      </div>
    </section>
  )
}
