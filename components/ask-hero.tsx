'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Github } from 'lucide-react'

import { AgentAnswer } from '@/components/agent-answer'
import { AskInput } from '@/components/ask-input'
import { Button } from '@/components/ui/button'
import { useAsk } from '@/lib/ask-context'
import { site } from '@/lib/site'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const SUGGESTIONS = [
  'Can it take actions?',
  'Can it hand off to a human?',
  'Can I self-host it?',
  'How does it compare to LangChain?',
]

/** Tailwind's `lg` — where the hero splits into headline | conversation columns. */
const TWO_COLUMN_PX = 1024
/** Matches the `scroll-mt-28` on the frame: clearance for the sticky nav. */
const NAV_OFFSET_PX = 112

/**
 * Below `lg` the window sizes itself to the newest message; cap it so a very long
 * answer can't push the rest of the page far down. Smaller on phones, where the
 * input + suggestions also need to stay in view. At `lg`+ the window has a fixed
 * height from CSS instead, so this doesn't apply.
 */
function maxWindowPx() {
  const vh = window.innerHeight
  return window.innerWidth < 640 ? vh * 0.48 : vh * 0.7
}

export function AskHero() {
  const { transcript, pending, streaming, error, ask, answerRef } = useAsk()
  const frameRef = useRef<HTMLDivElement | null>(null)
  const lastRef = useRef<HTMLDivElement | null>(null)
  // The seeded answer reads from its question down; once a visitor asks, the window
  // follows the newest message instead.
  const seededOnly = transcript.length === 1 && !error

  // Only the newest message shows by default; earlier exchanges stay mounted above
  // and are reachable by scrolling up inside the window. At `lg`+ the window is a
  // fixed-height pane and only its scroll position moves. Below `lg` it is sized to
  // the newest message and grows with the answer as it streams.
  useIsomorphicLayoutEffect(() => {
    const container = answerRef.current
    const last = lastRef.current
    if (!container || !last) return

    const fit = () => {
      if (window.innerWidth >= TWO_COLUMN_PX) {
        // Drop any height left over from a narrower viewport so the CSS one wins.
        container.style.height = ''
      } else {
        // Span from the top of the newest message to the bottom of the scroll
        // content, plus the container's own top padding so the message doesn't sit
        // flush against the frame. Bottom-pinning then lands the window's top edge
        // one padding-step above that message.
        const padTop = parseFloat(getComputedStyle(container).paddingTop) || 0
        const needed = container.scrollHeight - last.offsetTop + padTop
        container.style.height = `${Math.min(needed, maxWindowPx())}px`
      }
      container.scrollTop = seededOnly ? 0 : container.scrollHeight - container.clientHeight
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(last)
    // An earlier message resizing (font swap, image load) moves the newest one
    // without changing its size — watching the whole column catches that.
    if (last.parentElement) ro.observe(last.parentElement)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
    // Re-bind when the newest element changes (new message or error banner).
  }, [transcript.length, error, answerRef, seededOnly])

  // Bring the window itself into view when a new question is asked — unless it is
  // already on screen, which it always is in the two-column layout, where scrolling
  // would just be an unprompted jump.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    requestAnimationFrame(() => {
      const el = frameRef.current
      if (!el) return
      const { top, bottom } = el.getBoundingClientRect()
      if (top >= NAV_OFFSET_PX && bottom <= window.innerHeight) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [transcript.length])

  // The blocks shown in the conversation, oldest first. The error banner (if any)
  // is the last block so it becomes the newest, scrolled-to entry.
  const blocks = transcript.map((item, i) => {
    if (item.answer === null) {
      return (
        <AgentAnswer
          key={i}
          question={item.question}
          data={streaming ?? { body: 'Grounding answer in your documents', sources: [] }}
          streaming
          variant="chat"
        />
      )
    }
    return <AgentAnswer key={i} question={item.question} data={item.answer} variant="chat" />
  })

  if (error) {
    blocks.push(
      <div
        key="error"
        className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
      >
        {error}
      </div>,
    )
  }

  const lastIndex = blocks.length - 1

  return (
    <section className="pb-16 pt-10 sm:pt-14">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:max-w-6xl xl:max-w-7xl">
        <div className="grid items-center gap-8 text-center sm:gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14 lg:text-left">
          <div>
            <h1
              className="rise-in font-serif text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl"
              style={{ '--rise-delay': '60ms' } as React.CSSProperties}
            >
              Your{' '}
              <span className="scribble-underline">
                voice
                <ScribbleSvg />
              </span>{' '}
              in the conversation.
            </h1>

            <p
              className="rise-in mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:mx-0"
              style={{ '--rise-delay': '160ms' } as React.CSSProperties}
            >
              Radioso is the platform for building AI agents that speak for your organization
              &mdash; answering customers, guiding them, getting things done &mdash; grounded in
              what&apos;s true about you and transparent in how they work.
            </p>

            <div
              className="rise-in mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start"
              style={{ '--rise-delay': '260ms' } as React.CSSProperties}
            >
              <Button asChild size="lg">
                <Link href="/#quickstart">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={site.githubUrl} target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <div
              ref={frameRef}
              style={{ '--rise-delay': '360ms' } as React.CSSProperties}
              className="rise-in flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-border bg-card/90 text-left shadow-lg shadow-black/5 ring-1 ring-black/[0.03] backdrop-blur-md dark:shadow-black/30 dark:ring-white/[0.06]"
            >
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
                <Image src="/radioso-icon.svg" alt="" width={16} height={16} className="size-4" />
                <span className="text-[13px] font-medium text-foreground/90">Ask Radioso</span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="pulse-dot" />
                  live
                </span>
              </div>

              {/* `relative` is load-bearing: fit() measures messages by offsetTop against this. */}
              <div
                ref={answerRef}
                className="no-scrollbar relative overflow-y-auto overflow-x-hidden px-4 py-4 lg:h-[min(52vh,400px)]"
              >
                <div className="flex flex-col gap-6">
                  {blocks.map((block, i) => (
                    <div key={block.key ?? i} ref={i === lastIndex ? lastRef : undefined}>
                      {block}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/70 bg-background/40 p-3">
                <div className="rise-in" style={{ '--rise-delay': '460ms' } as React.CSSProperties}>
                  <AskInput
                    autoFocus
                    className="rounded-full border border-border bg-background/70 p-1.5 pl-4 transition-colors focus-within:border-primary/40 focus-within:bg-background"
                  />
                </div>

                <div
                  className="rise-in mt-2.5 flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-2"
                  style={{ '--rise-delay': '560ms' } as React.CSSProperties}
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void ask(s)}
                      disabled={pending}
                      className="rounded-full border border-border bg-card/70 px-3 py-2 text-[11px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScribbleSvg() {
  return (
    <svg viewBox="0 0 300 12" fill="none" preserveAspectRatio="none" aria-hidden>
      <path
        d="M2 7 C 60 2, 110 11, 170 5 S 260 9, 298 4"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}
