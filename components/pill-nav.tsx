'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Github, LogIn } from 'lucide-react'

import { site } from '@/lib/site'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV = [
  { href: site.docsUrl, label: 'Docs' },
  { href: '/blog', label: 'Blog' },
]

function isNavItemActive(pathname: string, href: string) {
  return href.startsWith('/') && (pathname === href || pathname.startsWith(`${href}/`))
}

export function PillNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Blur-and-fade rather than a painted gradient: the scrim has to pass over
          the dark machine band as well as the cream page, and a `from-background`
          gradient would drag a cream slab across it. A masked backdrop-blur takes
          its color from whatever is actually behind it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      />
      <div className="sticky top-4 z-50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
          {/*
            The pill is sized by its contents, not stretched to a width. On phones
            it goes full-bleed (minus a hair of inset) with the logo and hamburger
            pushed to the edges; from `md` up it hugs its content and stays centred,
            so it always reads as one deliberate object rather than a stretched bar.
            The rhythm is carried by the gaps: `md:gap-8` between the three groups
            (logo / links / actions) against much tighter gaps inside each group.
          */}
          <nav className="relative mx-auto flex w-full max-w-[calc(100%-1rem)] items-center justify-between gap-2 rounded-full border border-border/70 bg-card/90 p-1.5 pl-3 shadow-lg shadow-primary/10 backdrop-blur-md sm:gap-3 sm:pl-5 md:w-full md:pl-6">
            <Link href="/" aria-label={site.name} className="inline-flex shrink-0 items-center">
              <Logo
                priority
                imageClassName="h-9 w-auto sm:h-10"
              />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
              <div className="hidden items-center gap-1 md:flex">
                {NAV.map((item) => {
                  const active = isNavItemActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <div className="hidden items-center gap-0.5 md:flex">
                  <ThemeToggle className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
                  <Link
                    href={site.githubUrl}
                    aria-label="GitHub"
                    className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Github className="size-4" />
                  </Link>
                </div>

                <div aria-hidden className="mx-1 hidden h-6 w-px bg-border md:block" />

                <Link
                  href={site.appUrl}
                  className="hidden h-9 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
                >
                  Log in / Sign up
                </Link>

                <button
                  type="button"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                >
                  {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
              </div>
            </div>

            {menuOpen && (
              <div className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-border bg-card p-2 shadow-xl md:hidden">
                <div className="flex flex-col">
                  {NAV.map((item) => {
                    const active = isNavItemActive(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                  <div className="my-1 h-px bg-border" />
                  <ThemeToggle
                    showLabel
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  />
                  <Link
                    href={site.githubUrl}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Github className="size-4" />
                    GitHub
                  </Link>
                  <Link
                    href={site.appUrl}
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <LogIn className="size-4" />
                    Log in / Sign up
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
