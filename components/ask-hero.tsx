'use client'

import { AgentAnswer } from '@/components/agent-answer'
import { useAsk } from '@/lib/ask-context'

const SUGGESTIONS = [
  'Can it take actions?',
  'Can it hand off to a human?',
  'Can I self-host it?',
  'How does it compare to LangChain?',
]

export function AskHero() {
  const { asked, pending, streaming, error, ask, answerRef } = useAsk()

  return (
    <section className="pb-16 pt-10 sm:pt-14">
      <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 xl:max-w-4xl 2xl:max-w-5xl">
        <h1 className="font-serif text-balance text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl">
          Grounded agents that don&apos;t just talk &mdash; they{' '}
          <span className="scribble-underline">
            act
            <ScribbleSvg />
          </span>
          .
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
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

        <div ref={answerRef} className="mt-12 scroll-mt-28 text-left">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {!error && pending && streaming && (
            <AgentAnswer question={asked.question} data={streaming} streaming />
          )}
          {!error && pending && !streaming && (
            <AgentAnswer
              question={asked.question}
              data={{ body: 'Grounding answer in your documents', sources: [] }}
              streaming
            />
          )}
          {!error && !pending && asked.answer && (
            <AgentAnswer question={asked.question} data={asked.answer} />
          )}
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
