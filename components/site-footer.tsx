import Link from 'next/link'

import { site } from '@/lib/site'
import { Logo } from '@/components/logo'
import { SparkMark } from '@/components/pixel-sprite'

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background">
      <SparkMark
        className="absolute right-[12%] top-10 size-5"
        color="var(--secondary)"
        style={{ animationDelay: '0.5s' }}
      />
      <SparkMark
        className="absolute right-[28%] bottom-16 hidden size-4 md:block"
        color="var(--primary)"
        style={{ animationDelay: '1.4s' }}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center" aria-label={site.name}>
            <Logo imageClassName="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{site.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
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
          <div>
            <p className="font-semibold tracking-tight">Editions</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href={site.githubUrl} className="hover:text-foreground">
                  Open source
                </Link>
              </li>
              <li>
                <Link href={`${site.docsUrl}/enterprise`} className="hover:text-foreground">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Radioso</p>
          <p>Self-hosted. Multi-provider. API-first.</p>
        </div>
      </div>
    </footer>
  )
}
