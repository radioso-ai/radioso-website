'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'

import { AgentAnswer } from '@/components/agent-answer'
import { AskInput } from '@/components/ask-input'
import { track } from '@/lib/analytics'
import { TALK_TO_THE_TEAM, useAsk } from '@/lib/ask-context'
import type { AgentAnswerData } from '@/lib/agent'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const PANEL_ID = 'radioso-chat'

/**
 * The agent speaks first, the way a support widget does. Canned rather than fetched:
 * the site is a static export, and a greeting has nothing to ground.
 */
const OPENER: AgentAnswerData = {
  body: 'Hi, I handle support for Radioso. Ask me about setup, pricing, or how a handoff to a person works.',
  sources: [],
}

// Name Radioso explicitly rather than saying "it". The live agent reads a bare "it" as
// itself and answers about its own limits: "Can it take actions?" returned "I can't take
// actions on your behalf", contradicting the product's whole pitch. "Can I self-host it?"
// is safe because it asks about the visitor's action, not the assistant's capability.
//
// The last chip is deliberately not a question: it trips the `talk-to-the-team` routine on
// the live agent, so the visitor watches it run a real multi-step flow (qualify, collect
// email, hand to a human) instead of being told that routines exist.
const QUICK_REPLIES = [
  'How does Radioso take actions?',
  "What happens when Radioso can't answer?",
  'Can I self-host it?',
  TALK_TO_THE_TEAM,
]

/**
 * The live Radioso agent, as a support widget in the corner of every page.
 *
 * Closed, it is a round launcher with the mark, lifted clear of the cookie strip while
 * that is showing (the banner publishes its height as `--cookie-strip-h`). Open, it is a
 * chat window: header, transcript, and an input that never leaves the bottom edge. A
 * full-screen sheet on phones. Anything on the site that calls `ask()` opens it.
 */
export function ChatLauncher() {
  const {
    transcript,
    pending,
    streaming,
    answerSource,
    error,
    ask,
    open,
    openReason,
    openLauncher,
    closeLauncher,
    inputRef,
  } = useAsk()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const columnRef = useRef<HTMLDivElement | null>(null)
  const lastRef = useRef<HTMLDivElement | null>(null)
  // Quick replies are how the conversation starts; once it has, it's an ordinary chat.
  const showReplies = transcript.length === 0 && !pending

  // Focus follows the panel: into it when the visitor opens it, back to the launcher when
  // they close it. A launcher restored open by the session leaves focus alone. On touch
  // screens focus lands on the panel, not the input, so no keyboard pops up unasked.
  const wasOpen = useRef(open)
  useEffect(() => {
    if (open && !wasOpen.current && openReason !== 'restore') {
      requestAnimationFrame(() => {
        const input = inputRef.current
        const fine = window.matchMedia('(pointer: fine)').matches
        if (fine && input && !input.disabled) input.focus({ preventScroll: true })
        else panelRef.current?.focus({ preventScroll: true })
      })
    }
    if (!open && wasOpen.current) buttonRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open, openReason, inputRef])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLauncher('escape')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeLauncher])

  // The window follows the newest exchange until its question reaches the top edge, then
  // stops, so a long answer reads from its question down rather than from its last line.
  useIsomorphicLayoutEffect(() => {
    const box = scrollRef.current
    const column = columnRef.current
    if (!open || !box || !column) return

    const follow = () => {
      const last = lastRef.current
      const max = box.scrollHeight - box.clientHeight
      if (!last) {
        box.scrollTop = max
        return
      }
      const padTop = parseFloat(getComputedStyle(box).paddingTop) || 0
      box.scrollTop = Math.min(max, last.offsetTop - padTop)
    }

    follow()
    const ro = new ResizeObserver(follow)
    ro.observe(column)
    return () => ro.disconnect()
  }, [open, transcript.length, error])

  const blocks = transcript.map((item, i) =>
    item.answer === null ? (
      <AgentAnswer
        key={i}
        question={item.question}
        data={streaming ?? { body: 'Thinking', sources: [] }}
        streaming={streaming !== null}
        placeholder={streaming === null}
      />
    ) : (
      <AgentAnswer key={i} question={item.question} data={item.answer} />
    ),
  )

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

  return (
    <>
      <div
        ref={panelRef}
        id={PANEL_ID}
        role="dialog"
        aria-label="Chat with Radioso"
        tabIndex={-1}
        hidden={!open}
        className="chat-panel fixed inset-x-0 bottom-[var(--cookie-strip-h,0px)] top-0 z-[55] flex flex-col bg-card text-left text-foreground outline-none sm:inset-x-auto sm:bottom-[calc(var(--cookie-strip-h,0px)+6rem)] sm:right-6 sm:top-auto sm:h-[min(560px,calc(100dvh-var(--cookie-strip-h,0px)-8.5rem))] sm:w-[min(380px,calc(100vw-3rem))] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl sm:shadow-black/15 dark:sm:shadow-black/50"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border/70 py-2 pl-4 pr-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-2">
          <Image src="/radioso-icon.svg" alt="" width={20} height={20} className="size-5" />
          <span className="text-sm font-semibold">Radioso</span>
          {/* A quiet pulse once the production agent has answered; nothing otherwise.
              The visitor is talking to support, not reading a status panel. */}
          {answerSource === 'live' && <span className="pulse-dot ml-1" aria-hidden />}
          <button
            type="button"
            onClick={() => closeLauncher('header')}
            aria-label="Close chat"
            className="ml-auto inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* `relative` is load-bearing: the follow logic measures offsetTop against this. */}
        <div
          ref={scrollRef}
          className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4"
        >
          <div ref={columnRef} className="flex flex-col gap-6">
            <div>
              <AgentAnswer data={OPENER} />
              {showReplies && (
                <div className="mt-3 flex flex-wrap gap-2 pl-[30px]">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => {
                        track('launcher_chip_click', { question: reply })
                        void ask(reply)
                      }}
                      className="min-h-10 rounded-full border border-primary/35 bg-card px-3.5 py-1.5 text-left text-sm font-medium leading-snug text-primary transition-[border-color,background-color] duration-[var(--dur-fast)] hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {blocks.map((block, i) => (
              <div key={block.key ?? i} ref={i === blocks.length - 1 ? lastRef : undefined}>
                {block}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-border/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
          <AskInput className="rounded-full border border-border bg-background/70 p-1.5 pl-4 transition-colors focus-within:border-primary/35 focus-within:bg-background" />
        </div>
      </div>

      {/* Row-reversed so the label can follow the button in the DOM and answer to its
          hover through `peer`, while still sitting to its left. On a phone the open sheet
          covers the corner, and carries its own close button. */}
      <div
        className={`fixed bottom-[calc(var(--cookie-strip-h,0px)+1rem)] right-4 z-[55] flex flex-row-reverse items-center gap-3 sm:bottom-[calc(var(--cookie-strip-h,0px)+1.5rem)] sm:right-6 ${
          open ? 'max-sm:hidden' : ''
        }`}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          aria-label={open ? 'Close chat' : 'Chat with us'}
          onClick={() => (open ? closeLauncher('button') : openLauncher('button'))}
          className="chat-launcher-button peer inline-flex size-14 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {open ? (
            <X className="size-6" />
          ) : (
            <Image src="/radioso-icon.svg" alt="" width={28} height={28} className="size-7" />
          )}
        </button>
        {!open && (
          <span
            aria-hidden
            className="chat-launcher-label pointer-events-none hidden rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-md sm:block"
          >
            Chat with us
          </span>
        )}
      </div>
    </>
  )
}
