'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { Send, Menu, X, Github, LogIn } from 'lucide-react'

import { site } from '@/lib/site'
import { useAsk } from '@/lib/ask-context'
import { Logo } from '@/components/logo'

const NAV = [{ href: site.docsUrl, label: 'Docs' }]

/**
 * Render the typed question with any case-insensitive occurrence of `radioso`
 * wrapped in `<strong>`. Used by the input's overlay layer — the real input is
 * transparent so it still owns the caret while this overlay shows the styled text.
 */
function renderWithRadioso(text: string): ReactNode {
  return text.split(/(radioso)/i).map((part, i) =>
    part.toLowerCase() === 'radioso' ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export function PillNav() {
  const { question, setQuestion, ask, pending, inputRef } = useAsk()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    inputRef.current?.focus({ preventScroll: true })
  }, [inputRef])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void ask(question)
  }

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 bg-gradient-to-b from-background from-30% to-transparent"
      />
      <div className="sticky top-4 z-50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
        <nav className="relative mx-auto flex w-full items-center gap-2 rounded-full border border-border/70 bg-card/90 p-1.5 pl-3 shadow-lg shadow-primary/10 backdrop-blur-md sm:gap-3 sm:pl-5 lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl">
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

          <div aria-hidden className="mx-1 hidden h-7 w-px bg-border lg:block" />

          <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="relative flex min-w-0 flex-1 items-center">
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                aria-label="Ask a question about radioso"
                disabled={pending}
                className="h-10 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-transparent caret-foreground outline-none disabled:opacity-60 sm:px-3"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap px-2 text-[15px] sm:px-3"
              >
                {question ? (
                  <span className="text-foreground">{renderWithRadioso(question)}</span>
                ) : (
                  <span className="text-muted-foreground/80">
                    Ask a question about{' '}
                    <strong className="font-semibold text-foreground/85">radioso</strong>…
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={pending || !question.trim()}
              aria-label="Ask"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4 -translate-x-px translate-y-px" />
            </button>
          </form>

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
