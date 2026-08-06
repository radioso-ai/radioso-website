import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SparkMark } from '@/components/pixel-sprite'

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:pb-28">
      <div className="panel relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-14">
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
        <h2 className="display-serif mx-auto max-w-2xl font-serif text-2xl font-bold tracking-tight sm:text-3xl">
          Every organization deserves a voice.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          For thirty years, using the internet meant clicking. Increasingly it will mean talking
          &mdash; to agents that book the flight, find the recipe, fill the order. Every
          organization will need a way to speak for itself in that conversation.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Radioso runs on your infrastructure, with your model keys, and your data stays in your
          Postgres. Your voice stays yours.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/#quickstart">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog/why-radioso-exists">Why we built this</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
