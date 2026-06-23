import { readFile } from 'node:fs/promises'
import path from 'node:path'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { site } from '@/lib/site'

type LegalPageProps = {
  description: string
  fileName: string
}

function legalHref(href: string | undefined) {
  if (!href) {
    return href
  }

  if (href === './privacy-policy.md' || href === 'privacy-policy.md') {
    return '/legal/privacy-policy'
  }

  if (href === './terms-of-service.md' || href === 'terms-of-service.md') {
    return '/legal/terms-of-service'
  }

  return href
}

export async function LegalPage({ description, fileName }: LegalPageProps) {
  const markdown = await readFile(path.join(process.cwd(), 'legal', fileName), 'utf8')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="inline-flex items-center" aria-label={site.name}>
            <Logo imageClassName="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <article className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
          <p className="mb-8 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-4 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-12 border-t border-border/70 pt-8 text-2xl font-semibold tracking-tight text-foreground">
                  {children}
                </h2>
              ),
              h3: ({ children }) => <h3 className="mt-8 text-lg font-semibold text-foreground">{children}</h3>,
              p: ({ children }) => <p className="mt-4 text-sm leading-7 text-muted-foreground">{children}</p>,
              a: ({ children, href }) => {
                const normalizedHref = legalHref(href)

                return (
                  <Link href={normalizedHref ?? '#'} className="font-medium text-foreground underline underline-offset-4">
                    {children}
                  </Link>
                )
              },
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">{children}</ul>
              ),
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="mt-6 border-l-2 border-primary pl-4 text-sm text-muted-foreground">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</code>
              ),
              hr: () => <div className="my-10 h-px bg-border/70" />,
              table: ({ children }) => (
                <div className="mt-6 overflow-x-auto rounded-md border border-border/70">
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-border/70 bg-muted/50 px-4 py-3 font-semibold text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => <td className="border-b border-border/50 px-4 py-3 text-muted-foreground">{children}</td>,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
