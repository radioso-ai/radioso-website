import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

import { site } from '@/lib/site'

const snippet = `# requires Node 24 + Docker Desktop
./run-dev.sh

# then open
# http://localhost:3000   web app
# http://localhost:8080   API`

export function Quickstart() {
  return (
    <section id="quickstart" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
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
              <Link href={`${site.githubUrl}#quick-start`}>Setup guide</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">~/radioso</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-foreground">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
