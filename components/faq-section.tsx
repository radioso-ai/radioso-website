'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { SparkMark } from '@/components/pixel-sprite'
import { useAsk } from '@/lib/ask-context'
import { cn } from '@/lib/utils'

type Item = { question: string; answer: string }

// Every question stays within a topic the live agent answers well and the canned
// fallback in lib/agent.ts routes cleanly (self-host, pricing/licensing, LangChain,
// MCP), so the offline path degrades gracefully too.
const ITEMS: Item[] = [
  {
    question: 'Is Radioso really open source, or is there a paid tier?',
    answer:
      'Every product feature ships in the open release. The Enterprise Edition covers multi-tenant deployments at scale.',
  },
  {
    question: 'Can I self-host it?',
    answer:
      'Yes — the whole stack runs on your own infrastructure with Docker Compose. Documents, conversations, and vectors all stay in your own Postgres.',
  },
  {
    question: 'Which LLM providers can I use, and what does inference cost?',
    answer:
      'Bring your own keys — OpenAI, Anthropic, and more. You pay your provider directly, at their price.',
  },
  {
    question: 'Can it take actions, or is it just a chatbot?',
    answer:
      'It calls tools, fires webhooks, and runs multi-step routines — then hands off to a person with full context when it should.',
  },
  {
    question: 'How does it compare to LangChain?',
    answer:
      'Frameworks give you primitives to assemble yourself. Radioso ships the assembled product — ingestion, retrieval, agent runtime, chat UI, API, and MCP server, pre-wired.',
  },
  {
    question: 'Can I plug it into Cursor or Claude via MCP?',
    answer:
      'Yes — a standalone MCP server ships with it. Your knowledge base becomes a tool any MCP client can call, citations attached.',
  },
]

export function FaqSection() {
  const { ask, pending } = useAsk()
  // One panel open at a time; the first is open by default so the pattern reads.
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--primary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions? Ask the product.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Short answers below &mdash; or press{' '}
          <span className="font-medium text-primary">Ask the agent</span> and watch the live agent
          up top answer it for real, grounded in the docs, citations included.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-3">
        {ITEMS.map((item, i) => {
          const isOpen = open === i
          const buttonId = `faq-button-${i}`
          const panelId = `faq-panel-${i}`
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-border bg-card/60 shadow-sm transition-colors duration-300 hover:border-primary/40"
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
                  <span className="font-serif text-base font-semibold text-foreground sm:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-300',
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
                <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {item.answer}
                </p>
                <button
                  type="button"
                  onClick={() => void ask(item.question)}
                  disabled={pending}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <SparkMark className="size-3.5" color="currentColor" />
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
