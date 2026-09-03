import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

export function ClosingCta() {
  return (
    <section className="brand-bookend brand-bookend-signal relative w-full overflow-hidden border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center sm:py-24">
        <h2 className="display-serif mx-auto max-w-2xl font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Every organization should shape its own conversations.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          For thirty years, using the internet meant clicking. Increasingly it will mean talking
          &mdash; to agents that book the flight, find the recipe, fill the order. Every
          organization will need a way to represent itself in that conversation.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Radioso is open source end to end. Run it in our cloud or on your own infrastructure
          &mdash; your model keys, your Postgres, your data either way.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="h-12 bg-foreground px-7 text-base font-semibold text-background hover:bg-foreground/90"
          >
            <Link href={site.appUrl}>Start in the cloud</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-transparent text-foreground shadow-none hover:bg-foreground/10 hover:text-foreground dark:bg-transparent"
          >
            <Link href="/blog/why-radioso-exists">Why we built this</Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">No credit card required.</p>
      </div>
    </section>
  )
}
