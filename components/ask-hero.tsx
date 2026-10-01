'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { AgentAnswer } from '@/components/agent-answer'
import { AskInput } from '@/components/ask-input'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'
import { TALK_TO_THE_TEAM, useAsk, type AnswerSource } from '@/lib/ask-context'
import { site } from '@/lib/site'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Name Radioso explicitly rather than saying "it". The live agent reads a bare "it" as
// itself and answers about its own limits — "Can it take actions?" returned "I can't take
// actions on your behalf", contradicting the product's whole pitch. "Can I self-host it?"
// is safe because it asks about the visitor's action, not the assistant's capability.
//
// The chips are the card's main interface; free text sits behind a link because almost
// nobody types into a blank box. Each one asks what a buyer needs settled after the seeded
// handoff answer: does it act, what happens at the edge of its knowledge, can I own it.
//
// The last chip is deliberately not a question: it trips the `talk-to-the-team` routine on
// the live agent, so the visitor watches it run a real multi-step flow (qualify → collect
// email → hand to a human) instead of being told that routines exist.
const SUGGESTIONS = [
  'How does Radioso take actions?',
  "What happens when Radioso can't answer?",
  'Can I self-host it?',
  TALK_TO_THE_TEAM,
]

/**
 * The header badge only claims what is true of the newest answer. The seeded exchange is
 * canned, so it gets a muted label and no dot until a visitor's own question has come back.
 */
const BADGE: Record<AnswerSource, { label: string; title: string }> = {
  seed: {
    label: 'from the docs',
    title: 'A prepared answer from the Radioso docs. Ask something to reach the live agent.',
  },
  live: { label: 'live', title: 'Answered just now by the Radioso agent in production.' },
  demo: {
    label: 'demo',
    title: 'The live agent was unreachable, so this is a prepared answer.',
  },
}

/** Tailwind's `lg` — where the hero splits into headline | conversation columns. */
const TWO_COLUMN_PX = 1024
/** Matches the `scroll-mt-28` on the frame: clearance for the sticky nav. */
const NAV_OFFSET_PX = 112

/**
 * Below `lg` the window sizes itself to the newest message; cap it so a very long
 * answer can't push the rest of the page far down. Smaller on phones, where the
 * input + suggestions also need to stay in view. At `lg`+ the window hugs its
 * content up to a CSS `max-height` instead, so this doesn't apply.
 */
function maxWindowPx() {
  const vh = window.innerHeight
  return window.innerWidth < 640 ? vh * 0.48 : vh * 0.7
}

export function AskHero() {
  const { transcript, pending, streaming, answerSource, error, ask, answerRef, inputRef } = useAsk()
  const frameRef = useRef<HTMLDivElement | null>(null)
  const lastRef = useRef<HTMLDivElement | null>(null)
  const badge = BADGE[answerSource]

  // Free text stays behind "Ask your own question" until the visitor opens it. Once
  // anything has been asked — a chip, a typed question, or an ask from further down the
  // page — the input stays out for good.
  const [expanded, setExpanded] = useState(false)
  const inputOpen = expanded || transcript.length > 1 || error !== null
  // Focus only when the visitor opened the input themselves; an input revealed by a
  // chip must not pop the keyboard on a phone.
  const focusOnOpen = useRef(false)
  useEffect(() => {
    if (!expanded || !focusOnOpen.current) return
    focusOnOpen.current = false
    inputRef.current?.focus({ preventScroll: true })
  }, [expanded, inputRef])

  function openInput() {
    track('hero_input_expand')
    focusOnOpen.current = true
    setExpanded(true)
  }
  // The seeded answer reads from its question down; once a visitor asks, the window
  // follows the newest message instead.
  const seededOnly = transcript.length === 1 && !error

  // Only the newest message shows by default; earlier exchanges stay mounted above
  // and are reachable by scrolling up inside the window. At `lg`+ the window hugs
  // its content until it hits the CSS max-height, after which only its scroll
  // position moves. Below `lg` it is sized to the newest message and grows with the
  // answer as it streams.
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
          data={streaming ?? { body: 'Thinking', sources: [] }}
          streaming={streaming !== null}
          placeholder={streaming === null}
        />
      )
    }
    return <AgentAnswer key={i} question={item.question} data={item.answer} />
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

  // The extra top step at `lg` is for the conversation card, not the headline. From
  // `lg` the hero is two columns centred against each other and the card is much the
  // taller of the two, so it starts at the very top of the row — landing ~40px under
  // a sticky nav that is itself only 16px off the viewport. Below `lg` the card sits
  // under the copy and is nowhere near the nav.
  return (
    <section className="hero-band relative isolate pb-16 pt-10 sm:pt-14 lg:pt-20">
      {/* Everything in here emanates from the sun mark in the nav: the source
          glow and the three broadcast waves leaving it. */}
      <div aria-hidden className="hero-backdrop">
        <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
          <div className="signal-origin signal-source" />
          <div className="signal-origin signal-rings">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:max-w-6xl xl:max-w-7xl">
        <div className="grid items-center gap-8 text-center sm:gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14 lg:text-left">
          <div>
            <h1
              className="rise-in font-serif text-balance text-[color:var(--hero-ink)] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl xl:text-[2.375rem]"
              style={{ '--rise-delay': '60ms' } as React.CSSProperties}
            >
              {/* At `lg`+ the headline shares the row with the demo card, and `text-balance`
                  breaks the narrow column mid-sentence ("service, handled" on its own line). The
                  clause after the comma becomes a block there so the break lands on it instead.
                  The type ramp stays gentle (30 / 36 / 38) because the two-column layout caps
                  what fits: a wider step would make some breakpoint render larger than the
                  desktop hero. Below `lg` the headline is full-width and breaks fine on its
                  own — `self-hosted` just needs to stay whole so it can't split at the hyphen. */}
              <span className="lg:block">Customer service,</span>{' '}
              <span className="lg:block">handled by agents you own.</span>
            </h1>

            <p
              className="rise-in mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--hero-ink-muted)] sm:mt-6 sm:text-lg lg:mx-0"
              style={{ '--rise-delay': '160ms' } as React.CSSProperties}
            >
              {/* The category line comes first so the title tag, JSON-LD, and hero all say
                  the same thing. Each named demo deep-links to its tab below — the tab
                  section listens for these #demo-* hashes. */}
              Radioso is the customer service platform for AI agents. Open source, priced per
              conversation, run in our cloud or yours. See it{' '}
              <a href="#demo-support" className="hero-link">resolve a ticket</a>,{' '}
              <a href="#demo-docs" className="hero-link">answer from your help center</a>, and{' '}
              <a href="#demo-leads" className="hero-link">qualify a lead</a>.
            </p>

            <div
              className="rise-in mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start"
              style={{ '--rise-delay': '260ms' } as React.CSSProperties}
            >
              {/* Cloud first, self-host second: the cloud is the commercial path
                  and signup is genuinely self-serve; self-hostability is the proof
                  of ownership, not the headline act. The primary runs a size up
                  from the ghost so the hierarchy is unmistakable. GitHub keeps its
                  spots in the nav and footer. `bg-primary` is the site's blue,
                  invisible on the band, so the primary action inverts to the ink
                  colour and the secondary is a hairline ghost.

                  "Run it locally", not "self-host, in 5 minutes": five minutes is
                  the docker-compose bootstrap on your own machine. Real
                  self-hosting is a deployment project, and a label that
                  overclaims it reads as marketing-true at best. */}
              <Button
                asChild
                className="h-12 px-7 text-base font-semibold bg-[color:var(--hero-ink)] text-[color:var(--hero-bg)] hover:bg-[color:var(--hero-ink)]/90"
              >
                <Link href={site.appUrl}>Start in the cloud</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 text-sm border-[color:var(--hero-ink)]/30 bg-transparent text-[color:var(--hero-ink)] shadow-none hover:bg-[color:var(--hero-ink)]/10 hover:text-[color:var(--hero-ink)] dark:border-[color:var(--hero-ink)]/30 dark:bg-transparent dark:hover:bg-[color:var(--hero-ink)]/10 dark:hover:text-[color:var(--hero-ink)]"
              >
                <Link href="/developers#quickstart">Run it locally in 5 minutes</Link>
              </Button>
            </div>

            <p
              className="rise-in mt-3 text-sm text-[color:var(--hero-ink-muted)]"
              style={{ '--rise-delay': '300ms' } as React.CSSProperties}
            >
              No credit card &mdash; sign up and get straight to work.
            </p>
          </div>

          <div className="min-w-0">
            <div
              ref={frameRef}
              id="ask-radioso"
              style={{ '--rise-delay': '360ms' } as React.CSSProperties}
              className="rise-in flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-border bg-card/90 text-left shadow-lg shadow-black/5 ring-1 ring-black/[0.03] backdrop-blur-md dark:shadow-black/30 dark:ring-white/[0.06]"
            >
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
                <Image src="/radioso-icon.svg" alt="" width={16} height={16} className="size-4" />
                <span className="text-[13px] font-medium text-foreground/90">Ask Radioso</span>
                {/* "live" only once the API has answered a visitor; "demo" when the canned
                    stub served instead (dev, blocked origin, API down). */}
                <span
                  title={badge.title}
                  className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  {answerSource === 'live' && <span className="pulse-dot" />}
                  {answerSource === 'demo' && (
                    <span className="size-2 rounded-full bg-muted-foreground/50" />
                  )}
                  {badge.label}
                </span>
              </div>

              {/* `relative` is load-bearing: fit() measures messages by offsetTop against this. */}
              <div
                ref={answerRef}
                className="no-scrollbar relative overflow-y-auto overflow-x-hidden px-4 py-4 lg:max-h-[min(52vh,400px)]"
              >
                <div className="flex flex-col gap-6">
                  {blocks.map((block, i) => (
                    <div key={block.key ?? i} ref={i === lastIndex ? lastRef : undefined}>
                      {block}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/70 bg-background/40 p-3 sm:p-4">
                {/* Two content-sized columns rather than equal halves: at desktop widths the
                    longest chip fits on one line only if its column can take the slack the
                    shorter ones leave. Both columns still stretch to fill the row. */}
                <div
                  className="rise-in grid grid-cols-1 gap-2 sm:grid-cols-[auto_auto]"
                  style={{ '--rise-delay': '460ms' } as React.CSSProperties}
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        track('hero_chip_click', { question: s })
                        void ask(s)
                      }}
                      disabled={pending}
                      className="min-h-11 rounded-full border border-border bg-card px-4 py-2 text-left text-sm font-medium leading-snug text-foreground/85 transition-[border-color,background-color,color] hover:border-primary/35 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="rise-in mt-3" style={{ '--rise-delay': '560ms' } as React.CSSProperties}>
                  {!inputOpen && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={openInput}
                        aria-expanded={false}
                        aria-controls="ask-radioso-input"
                        className="rounded-md px-2 py-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                      >
                        Ask your own question
                      </button>
                    </div>
                  )}
                  <div id="ask-radioso-input" hidden={!inputOpen}>
                    <AskInput className="rounded-full border border-border bg-background/70 p-1.5 pl-4 transition-colors focus-within:border-primary/35 focus-within:bg-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
