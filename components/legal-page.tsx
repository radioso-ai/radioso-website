import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Markdown } from '@/components/markdown'
import { PageShell } from '@/components/page-shell'

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
    <PageShell>
      <article className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
        <p className="mb-8 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        <Markdown transformHref={legalHref}>{markdown}</Markdown>
      </article>
    </PageShell>
  )
}
