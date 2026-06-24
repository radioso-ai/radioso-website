'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

import { AgentAnswer } from '@/components/agent-answer'
import { AskInput } from '@/components/ask-input'
import { useAsk } from '@/lib/ask-context'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const SUGGESTIONS = [
  'Can it take actions?',
  'Can it hand off to a human?',
  'Can I self-host it?',
  'How does it compare to LangChain?',
]

/**
 * Cap the window so a very long answer can't push the rest of the page far down.
 * Smaller on phones, where the input + suggestions also need to stay in view.
 */
function maxWindowPx() {
  const vh = window.innerHeight
  return vh * (window.innerWidth < 640 ? 0.48 : 0.7)
}

export function AskHero() {
  const { transcript, pending, streaming, error, ask, answerRef } = useAsk()
  const lastRef = useRef<HTMLDivElement | null>(null)

  // The conversation lives in a fixed window sized to the newest message, so only
  // that message shows by default; earlier exchanges stay mounted above and are
  // reachable by scrolling up inside the window. The window grows with the answer
  // as it streams and stays pinned to the bottom (the newest content).
  useIsomorphicLayoutEffect(() => {
    const container = answerRef.current
    const last = lastRef.current
    if (!container || !last) return

    const fit = () => {
      container.style.height = `${Math.min(last.offsetHeight, maxWindowPx())}px`
      container.scrollTop = container.scrollHeight - container.clientHeight
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(last)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
    // Re-bind when the newest element changes (new message or error banner).
  }, [transcript.length, error, answerRef])

  // Bring the window itself into view when a new question is asked.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    requestAnimationFrame(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [transcript.length, answerRef])

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

  return (
    <section className="pb-16 pt-10 sm:pt-14">
      <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 xl:max-w-4xl 2xl:max-w-5xl">
        <h1
          className="rise-in font-serif text-balance text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl"
          style={{ '--rise-delay': '60ms' } as React.CSSProperties}
        >
          Grounded agents that don&apos;t just talk &mdash; they{' '}
          <span className="scribble-underline">
            act
            <ScribbleSvg />
          </span>
          .
        </h1>

        <div
          ref={answerRef}
          style={{ '--rise-delay': '220ms' } as React.CSSProperties}
          className="rise-in no-scrollbar mt-6 -mx-4 scroll-mt-28 overflow-y-auto overflow-x-hidden px-4 text-left sm:mt-10"
        >
          <div className="flex flex-col gap-6">
            {blocks.map((block, i) => (
              <div key={block.key ?? i} ref={i === lastIndex ? lastRef : undefined}>
                {block}
              </div>
            ))}
          </div>
        </div>

        <div className="rise-in" style={{ '--rise-delay': '340ms' } as React.CSSProperties}>
          <AskInput
            autoFocus
            className="mt-5 rounded-full border border-border/70 bg-card/90 p-1.5 pl-4 shadow-lg shadow-primary/10 backdrop-blur-md transition-shadow focus-within:shadow-xl focus-within:shadow-primary/20 sm:pl-5"
          />
        </div>

        <div
          className="rise-in mt-4 flex flex-wrap items-center justify-center gap-2"
          style={{ '--rise-delay': '440ms' } as React.CSSProperties}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              disabled={pending}
              className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background hover:text-foreground hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {s}
            </button>
          ))}
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
