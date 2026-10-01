import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

/**
 * The opening band: the claim and the two ways in, centred, full width. The
 * product itself is the pinned demo section directly beneath, which starts in
 * the first viewport and is the hero's visual. The live agent lives in the chat
 * launcher, on every page.
 */
export function Hero() {
  // Short at the bottom on purpose: the demo section's heading and tab bar have to
  // land in the first viewport at 1440x900, so the claim reads straight into tabs.
  return (
    <section className="hero-band relative isolate pb-10 pt-10 sm:pb-12 sm:pt-14 lg:pt-16">
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
      <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6 xl:max-w-7xl">
        <h1
          className="rise-in font-serif text-balance text-[color:var(--hero-ink)] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl"
          style={{ '--rise-delay': '60ms' } as React.CSSProperties}
        >
          {/* From `lg` each clause is unbreakable, so if the line has to wrap it
              wraps at the comma, never mid-clause ("service, handled" alone). */}
          <span className="lg:inline-block">Customer service,</span>{' '}
          <span className="lg:inline-block">handled by agents you own.</span>
        </h1>

        <p
          className="rise-in mx-auto mt-5 max-w-3xl text-balance text-base leading-relaxed text-[color:var(--hero-ink-muted)] sm:mt-6 sm:text-lg"
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
          className="rise-in mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center"
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
    </section>
  )
}
