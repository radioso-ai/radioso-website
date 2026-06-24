import Link from 'next/link'

import { site } from '@/lib/site'
import { Logo } from '@/components/logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center" aria-label={site.name}>
            <Logo imageClassName="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{site.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div>
            <p className="font-semibold tracking-tight">Product</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="#platform" className="hover:text-foreground">
                  The platform
                </Link>
              </li>
              <li>
                <Link href="#quickstart" className="hover:text-foreground">
                  Quick start
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold tracking-tight">Resources</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href={site.docsUrl} className="hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href={`${site.docsUrl}/api-reference`} className="hover:text-foreground">
                  API reference
                </Link>
              </li>
              <li>
                <Link href={site.githubUrl} className="hover:text-foreground">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Radioso</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/legal/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/legal/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <p>Self-hosted. Multi-provider. API-first.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
