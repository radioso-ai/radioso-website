import Link from 'next/link'

import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { site } from '@/lib/site'

type PageShellProps = {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
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
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
