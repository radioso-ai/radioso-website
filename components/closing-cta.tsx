import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SparkMark } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:pb-28">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))] px-6 py-12 text-center shadow-sm sm:px-12 sm:py-14">
        <SparkMark
          className="absolute left-[9%] top-8 size-5"
          color="var(--primary)"
          style={{ animationDelay: '0.3s' }}
        />
        <SparkMark
          className="absolute right-[11%] bottom-8 hidden size-4 sm:block"
          color="var(--secondary)"
          style={{ animationDelay: '1.2s' }}
        />
        <h2 className="mx-auto max-w-2xl font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          All your conversational agents. One self-hosted platform.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Grounded in your documents, running on your own infrastructure, and reaching every surface
          &mdash; web, API, SDK, and MCP.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/#quickstart">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`mailto:${site.contactEmail}`}>Contact us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
