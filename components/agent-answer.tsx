import Image from 'next/image'
import { FileText } from 'lucide-react'
import { Children, isValidElement } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  return (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents(sources)}
      >
        {streaming ? `${body}${STREAMING_CARET_TOKEN}` : body}
      </ReactMarkdown>
    </div>
  )
}

const STREAMING_CARET_TOKEN = '\uE000'

function markdownComponents(sources: AgentSource[]): Components {
  return {
    p({ children }) {
      return <p>{renderCitationChildren(children, sources)}</p>
    },
    a({ children, href }) {
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {renderCitationChildren(children, sources)}
        </a>
      )
    },
    ul({ children }) {
      return <ul className="ml-5 list-outside list-disc space-y-1 pl-1">{children}</ul>
    },
    ol({ children }) {
      return <ol className="ml-5 list-outside list-decimal space-y-1 pl-1">{children}</ol>
    },
    li({ children }) {
      return <li>{renderCitationChildren(children, sources)}</li>
    },
    strong({ children }) {
      return <strong className="font-semibold">{renderCitationChildren(children, sources)}</strong>
    },
    em({ children }) {
      return <em className="italic">{renderCitationChildren(children, sources)}</em>
    },
    h1({ children }) {
      return <p className="text-lg font-semibold">{renderCitationChildren(children, sources)}</p>
    },
    h2({ children }) {
      return <p className="font-semibold">{renderCitationChildren(children, sources)}</p>
    },
    h3({ children }) {
      return <p className="font-semibold">{renderCitationChildren(children, sources)}</p>
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-border pl-4 text-muted-foreground">
          {renderCitationChildren(children, sources)}
        </blockquote>
      )
    },
    code({ children, className }) {
      const isBlock = className?.startsWith('language-')
      if (isBlock) {
        return (
          <code className={`${className} font-mono text-[0.9em]`}>
            {children}
          </code>
        )
      }

      return (
        <code className="rounded-[5px] bg-muted px-1 py-0.5 font-mono text-[0.9em]">
          {children}
        </code>
      )
    },
    pre({ children }) {
      return (
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-[13px] leading-relaxed">
          {children}
        </pre>
      )
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">{children}</table>
        </div>
      )
    },
    th({ children }) {
      return (
        <th className="border-b border-border px-3 py-2 font-semibold">
          {renderCitationChildren(children, sources)}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="border-b border-border px-3 py-2 align-top">
          {renderCitationChildren(children, sources)}
        </td>
      )
    },
  }
}

function renderCitationChildren(children: ReactNode, sources: AgentSource[]): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') return renderCitationText(child, sources)
    if (!isValidElement<{ children?: ReactNode }>(child)) return child
    return child
  })
}

function renderCitationText(text: string, sources: AgentSource[]): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = new RegExp(`(${STREAMING_CARET_TOKEN}|\\[(\\d+)\\])`, 'g')
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))

    if (match[1] === STREAMING_CARET_TOKEN) {
      nodes.push(<span key={`caret-${key++}`} className="typing-caret align-middle" />)
    } else {
      const n = Number(match[2])
      const exists = sources.some((s) => s.n === n)
      nodes.push(<CitationPip key={`c-${key++}`} n={n} muted={!exists} />)
    }

    last = match.index + match[0].length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
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
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-foreground underline-offset-2 hover:underline"
        >
          {source.title}
        </a>
      ) : (
        <span className="font-mono text-foreground">{source.title}</span>
      )}
      {source.detail ? (
        <span className="text-muted-foreground/80">· {source.detail}</span>
      ) : null}
    </span>
  )
}

function AnsweredBy() {
  return (
    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
      <Image src="/radioso-icon.svg" alt="" width={14} height={14} className="opacity-80" />
      <span>
        Answers by <span className="font-medium text-foreground/80">Radioso</span>
      </span>
    </div>
  )
}
