'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { SignalMark } from '@/components/pixel-sprite'
import { useAsk } from '@/lib/ask-context'
import { FAQ_ITEMS } from '@/lib/faq'
import { cn } from '@/lib/utils'


export function FaqSection() {
  const { ask, pending } = useAsk()
  // One panel open at a time; the first is open by default so the pattern reads.
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SignalMark color="var(--primary)" />
        </div>
        <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Questions? Ask the product.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Short answers below &mdash; or press{' '}
          <span className="font-medium text-primary">Ask the agent</span> and watch the live agent
          up top answer it for real, grounded in the docs, citations included.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i
          const buttonId = `faq-button-${i}`
          const panelId = `faq-panel-${i}`
          // `surface`, not `interactive`: an accordion row warms its edge on
          // hover but must not lift, or the row you are about to click moves out
          // from under the pointer.
          return (
            <div
              key={item.question}
              className="surface rounded-2xl transition-colors duration-[var(--dur-fast)] hover:border-primary/35"
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="display-serif font-serif text-base font-semibold text-foreground sm:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="px-5 pb-5"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                <button
                  type="button"
                  onClick={() => void ask(item.question)}
                  disabled={pending}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary transition-all ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <SignalMark className="size-3.5" color="currentColor" />
                  Ask the agent
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
