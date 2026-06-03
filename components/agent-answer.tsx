import Image from 'next/image'
import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import type { AgentAnswerData, AgentSource } from '@/lib/agent'

type Props = {
  data: AgentAnswerData
  question?: string
  /** Show a thinking caret at the end of the body — used by the live one-shot input. */
  streaming?: boolean
  /** Compact = no surface chrome, used inline in FAQ rows. */
  variant?: 'card' | 'inline'
}

export function AgentAnswer({ data, question, streaming, variant = 'card' }: Props) {
  const body = renderBody(data.body, data.sources, streaming)

  const content = (
    <>
      {question && (
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-foreground/80">Q.</span> {question}
        </p>
      )}
      <div className="text-[15px] leading-relaxed text-foreground">{body}</div>
      {data.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Sources
          </span>
          {data.sources.map((s) => (
            <SourceChip key={s.n} source={s} />
          ))}
        </div>
      )}
      <AnsweredBy />
    </>
  )

  if (variant === 'inline') {
    return <div className="flex flex-col gap-4">{content}</div>
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-primary/12 via-transparent to-secondary/15 blur-2xl"
      />
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/85 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm sm:p-7">
        {content}
      </div>
    </div>
  )
}

function renderBody(body: string, sources: AgentSource[], streaming?: boolean): ReactNode {
  const parts: ReactNode[] = []
  const regex = /\[(\d+)\]/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(body)) !== null) {
    if (match.index > last) parts.push(body.slice(last, match.index))
    const n = Number(match[1])
    const exists = sources.some((s) => s.n === n)
    parts.push(<CitationPip key={`c-${key++}`} n={n} muted={!exists} />)
    last = match.index + match[0].length
  }
  if (last < body.length) parts.push(body.slice(last))
  if (streaming) parts.push(<span key="caret" className="typing-caret align-middle" />)
  return parts
}

function CitationPip({ n, muted }: { n: number; muted?: boolean }) {
  return (
    <sup
      className={
        muted
          ? 'ml-0.5 inline-flex size-4 items-center justify-center rounded-[6px] bg-muted align-super font-mono text-[10px] font-semibold text-muted-foreground'
          : 'ml-0.5 inline-flex size-4 items-center justify-center rounded-[6px] bg-primary/15 align-super font-mono text-[10px] font-semibold text-primary'
      }
    >
      {n}
    </sup>
  )
}

function SourceChip({ source }: { source: AgentSource }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
      <span className="inline-flex size-4 items-center justify-center rounded-[5px] bg-primary/15 font-mono text-[10px] font-semibold text-primary">
        {source.n}
      </span>
      <FileText className="size-3" />
      <span className="font-mono text-foreground">{source.title}</span>
      <span className="text-muted-foreground/80">· {source.detail}</span>
    </span>
  )
}

function AnsweredBy() {
  return (
    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
      <Image src="/radioso-icon.svg" alt="" width={14} height={14} className="opacity-80" />
      <span>
        Answered by <span className="font-medium text-foreground/80">Radioso</span> · grounded
        in this site&apos;s knowledge base
      </span>
    </div>
  )
}
