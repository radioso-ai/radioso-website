'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Github, LogIn } from 'lucide-react'

import { site } from '@/lib/site'
import { Logo } from '@/components/logo'

const NAV = [{ href: site.docsUrl, label: 'Docs' }]

export function PillNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 bg-gradient-to-b from-background from-30% to-transparent"
      />
      <div className="sticky top-4 z-50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
        <nav className="relative mx-auto flex w-fit max-w-[calc(100%-1rem)] items-center gap-2 rounded-full border border-border/70 bg-card/90 p-1.5 pl-3 shadow-lg shadow-primary/10 backdrop-blur-md sm:gap-3 sm:pl-5">
          <Link href="/" aria-label={site.name} className="inline-flex shrink-0 items-center">
            <Logo
              priority
              imageClassName="h-9 w-auto sm:h-10"
            />
          </Link>

          <div className="hidden items-center gap-0.5 pl-2 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          {menuOpen && (
            <div className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-border bg-card p-2 shadow-xl lg:hidden">
              <div className="flex flex-col">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-border" />
                <Link
                  href={site.githubUrl}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Github className="size-4" />
                  GitHub
                </Link>
                <Link
                  href={site.appUrl}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
                >
                  <LogIn className="size-4" />
                  Log in
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:right-6 lg:flex">
        <Link
          href={site.githubUrl}
          aria-label="GitHub"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <Github className="size-4" />
        </Link>
        <Link
          href={site.appUrl}
          aria-label="Log in"
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <LogIn className="size-4" />
          <span className="hidden 2xl:inline">Log in</span>
        </Link>
      </div>
      </div>
    </>
  )
}
