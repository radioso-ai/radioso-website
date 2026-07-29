import Link from 'next/link'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Off the air (404)',
  description: 'This page is off the air. Head back to the homepage or dip into the docs.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <Link href="/" className="inline-flex items-center" aria-label={site.name}>
          <Logo imageClassName="h-10 w-auto" />
        </Link>

        <p className="mt-12 font-mono text-sm font-medium tracking-widest text-primary">404</p>

        <h1 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl">
          This page is off the air.
        </h1>

        <p className="mt-4 max-w-md text-pretty text-muted-foreground">
          We couldn&apos;t tune into that signal &mdash; the page may have moved or never
          broadcast. Let&apos;s get you back to a live frequency.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={site.docsUrl}>Read the docs</a>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
