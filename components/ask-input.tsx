'use client'

import { useEffect, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Send } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAsk } from '@/lib/ask-context'
import { track } from '@/lib/analytics'

/**
 * Render the typed question with any case-insensitive occurrence of `radioso`
 * emphasised. Used by the field's mirror layer: the real textarea is transparent so it
 * still owns the caret, selection and spellcheck while the mirror shows the styled text.
 *
 * The emphasis is a stroke, not a heavier weight. Semibold glyphs are wider than regular
 * ones, so a bold "radioso" would push every later character, and every line break, out
 * of step with the textarea underneath: the caret would sit beside the text, not in it.
 */
function renderWithRadioso(text: string): ReactNode {
  return text.split(/(radioso)/i).map((part, i) =>
    part.toLowerCase() === 'radioso' ? (
      <strong key={i} className="font-normal [-webkit-text-stroke:0.04em_currentColor]">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/**
 * Shared by the textarea and its mirror, which must lay text out identically: same box,
 * same font, same wrapping. Change one, change both.
 */
const FIELD = 'col-start-1 row-start-1 min-w-0 px-2 py-2 text-base leading-6 whitespace-pre-wrap break-words sm:px-3'

/** The "Ask a question about radioso…" field + send button, sharing AskProvider state. */
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
    // Same guards as ask() itself, so the event counts questions that were sent. The
    // text stays out of analytics: visitors type emails and order numbers in here.
    if (question.trim() && !pending) track('launcher_free_text_submit')
    void ask(question)
  }

  // Enter sends, as it did when this was a one-line input. Shift+Enter breaks the line.
  // An Enter that confirms an IME composition is the visitor picking a character.
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <form onSubmit={onSubmit} className={cn('flex min-w-0 items-end gap-1.5', className)}>
      {/* The field grows with its text, up to four lines, then scrolls. The mirror is in
          flow and sets the height; the textarea shares its grid cell and stretches to fit,
          so both scroll together inside this box and never drift apart. */}
      <div className="no-scrollbar grid max-h-28 min-w-0 flex-1 scroll-py-2 overflow-y-auto overflow-x-hidden overscroll-contain">
        <textarea
          ref={inputRef}
          rows={1}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onKeyDown}
          enterKeyHint="send"
          aria-label="Ask a question about radioso"
          disabled={pending}
          className={cn(
            FIELD,
            'resize-none overflow-hidden bg-transparent text-transparent caret-foreground outline-none disabled:opacity-60',
          )}
        />
        <div aria-hidden className={cn(FIELD, 'pointer-events-none')}>
          {question ? (
            // The trailing zero-width space gives a final empty line, after Shift+Enter,
            // a height of its own, as the textarea does.
            <span className="text-foreground">
              {renderWithRadioso(question)}
              {'​'}
            </span>
          ) : (
            <span className="block truncate text-muted-foreground/80">
              Ask a question about <strong className="font-semibold text-foreground/85">radioso</strong>…
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
