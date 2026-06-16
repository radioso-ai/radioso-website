'use client'

import { useEffect, type FormEvent, type ReactNode } from 'react'
import { Send } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAsk } from '@/lib/ask-context'

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

/** The "Ask a question about radioso…" input + send button, sharing AskProvider state. */
export function AskInput({
  className,
  autoFocus = false,
}: {
  className?: string
  /** Focus the field on mount (desktop only). */
  autoFocus?: boolean
}) {
  const { question, setQuestion, ask, pending, inputRef } = useAsk()

  useEffect(() => {
    if (!autoFocus || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus, inputRef])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void ask(question)
  }

  return (
    <form onSubmit={onSubmit} className={cn('flex min-w-0 items-center gap-1.5', className)}>
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
  )
}
