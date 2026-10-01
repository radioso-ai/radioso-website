import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

/**
 * The opening band: the claim and the two ways in, centred, full width. The
 * product itself is the pinned demo section directly beneath, whose card
 * straddles the band's lower edge: the navy backdrop runs on past this section
 * and ends partway down the card (`--demo-lead` + `--demo-straddle` in
 * globals.css). The live agent lives in the chat launcher, on every page.
 */
export function Hero() {
  // Short at the bottom on purpose: the demo card starts a breath under the
  // footnote, so the claim reads straight into the product.
  return (
    <section className="hero-band relative isolate pb-6 pt-10 sm:pb-8 sm:pt-14 lg:pt-16">
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
        <p
          className="rise-in hero-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[color:var(--hero-ink-muted)]"
          style={{ '--rise-delay': '0ms' } as React.CSSProperties}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
          Open source &middot; priced per conversation
        </p>

        <h1
          className="rise-in mt-5 font-serif text-balance text-[color:var(--hero-ink)] text-4xl font-semibold leading-[1.06] tracking-tight sm:mt-6 sm:text-5xl lg:text-[3.5rem]"
          style={{ '--rise-delay': '60ms' } as React.CSSProperties}
        >
          {/* From `lg` the break is forced where the mock puts it; below that the
              line balances on its own. */}
          <span className="lg:block">Customer service, handled</span>{' '}
          <span className="lg:block">by agents you own.</span>
        </h1>

        <p
          className="rise-in mx-auto mt-5 max-w-[39rem] text-base leading-relaxed text-[color:var(--hero-ink-muted)] sm:mt-6 sm:text-lg"
          style={{ '--rise-delay': '160ms' } as React.CSSProperties}
        >
          {/* Each named job deep-links to its tab below; the tab section listens
              for these #demo-* hashes. */}
          Open-source AI agents that{' '}
          <a href="#demo-support" className="hero-link">resolve tickets</a>,{' '}
          <a href="#demo-docs" className="hero-link">answer from your help center</a> and{' '}
          <a href="#demo-leads" className="hero-link">qualify leads</a>. Pay per conversation. Run them in
          our cloud or yours.
        </p>

        <div
          className="rise-in mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center"
          style={{ '--rise-delay': '260ms' } as React.CSSProperties}
        >
          {/* Cloud first, self-host second: the cloud is the commercial path
              and signup is genuinely self-serve; self-hostability is the proof
              of ownership, not the headline act. The primary is the logo
              yellow with ink text, the one place a button takes it (see the
              decision log): `bg-primary` is the site's blue and disappears on
              the band.

              "Run it locally", not "self-host": five minutes is the
              docker-compose bootstrap on your own machine. Real self-hosting
              is a deployment project, so the time sits on the local run only. */}
          <Button
            asChild
            className="h-12 px-6 text-base font-semibold bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/90"
          >
            <Link href={site.appUrl}>
              Start in the cloud <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-6 text-base font-medium border-[color:var(--hero-ink)]/35 bg-transparent text-[color:var(--hero-ink)] shadow-none hover:bg-[color:var(--hero-ink)]/10 hover:text-[color:var(--hero-ink)] dark:border-[color:var(--hero-ink)]/35 dark:bg-transparent dark:hover:bg-[color:var(--hero-ink)]/10 dark:hover:text-[color:var(--hero-ink)]"
          >
            <Link href="/developers#quickstart">
              Run it locally
              <span className="rounded bg-[color:var(--hero-ink)]/10 px-1.5 py-0.5 font-mono text-xs font-normal text-[color:var(--hero-ink-muted)]">
                5 min
              </span>
            </Link>
          </Button>
        </div>

        <p
          className="rise-in mt-4 text-balance text-sm text-[color:var(--hero-ink-muted)]"
          style={{ '--rise-delay': '300ms' } as React.CSSProperties}
        >
          No credit card. Or ask the agent in the corner. It runs on Radioso.
        </p>
      </div>
    </section>
  )
}
