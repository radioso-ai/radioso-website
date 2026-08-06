import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

import { site } from '@/lib/site'
import { SparkMark } from '@/components/pixel-sprite'
import { QuickstartTerminal } from '@/components/quickstart-terminal'

export function Quickstart() {
  return (
    <section id="quickstart" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SparkMark className="mb-4 size-6" color="var(--primary)" />
          <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Working assistant in under five minutes.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            The bootstrap script prompts for your AI provider credentials, generates secrets, and
            starts the full stack with Docker Compose. Register, upload a document, ask a question.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={site.docsUrl}>
                Read the docs <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${site.docsUrl}/quickstarts/run-locally`}>Setup guide</Link>
            </Button>
          </div>
        </div>
        <QuickstartTerminal />
      </div>
    </section>
  )
}
