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
  const blocks = parseMarkdownBlocks(body)

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        const isLastBlock = index === blocks.length - 1

        if (block.type === 'ul' || block.type === 'ol') {
          const ListTag = block.type
          return (
            <ListTag
              key={index}
              className={
                block.type === 'ul'
                  ? 'ml-5 list-outside list-disc space-y-1 pl-1'
                  : 'ml-5 list-outside list-decimal space-y-1 pl-1'
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {renderInlineMarkdown(item, sources, `${index}-${itemIndex}`)}
                  {streaming && isLastBlock && itemIndex === block.items.length - 1 ? (
                    <span className="typing-caret align-middle" />
                  ) : null}
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === 'heading') {
          return (
            <p key={index} className="font-semibold text-foreground">
              {renderInlineMarkdown(block.text, sources, `${index}`)}
              {streaming && isLastBlock ? <span className="typing-caret align-middle" /> : null}
            </p>
          )
        }

        if (block.type === 'paragraph') {
          return (
            <p key={index}>
              {renderInlineMarkdown(block.text, sources, `${index}`)}
              {streaming && isLastBlock ? <span className="typing-caret align-middle" /> : null}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}

type MarkdownBlock =
  | { type: 'paragraph' | 'heading'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

function parseMarkdownBlocks(body: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = body.replace(/\r\n?/g, '\n').split('\n')
  let paragraph: string[] = []
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraph.join(' ').trim() })
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    blocks.push(list)
    list = null
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = trimmed.match(/^#{1,3}\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: heading[1].trim() })
      continue
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      flushParagraph()
      if (!list || list.type !== 'ul') {
        flushList()
        list = { type: 'ul', items: [] }
      }
      list.items.push(bullet[1].trim())
      continue
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (ordered) {
      flushParagraph()
      if (!list || list.type !== 'ol') {
        flushList()
        list = { type: 'ol', items: [] }
      }
      list.items.push(ordered[1].trim())
      continue
    }

    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${trimmed}`
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  return blocks.length > 0 ? blocks : [{ type: 'paragraph', text: body }]
}

function renderInlineMarkdown(text: string, sources: AgentSource[], keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let buffer = ''
  let i = 0
  let key = 0

  const flush = () => {
    if (!buffer) return
    nodes.push(buffer)
    buffer = ''
  }

  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        flush()
        nodes.push(
          <strong key={`${keyPrefix}-b-${key++}`} className="font-semibold">
            {renderInlineMarkdown(text.slice(i + 2, end), sources, `${keyPrefix}-b-${key}`)}
          </strong>,
        )
        i = end + 2
        continue
      }
    }

    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) {
        flush()
        nodes.push(
          <code
            key={`${keyPrefix}-code-${key++}`}
            className="rounded-[5px] bg-muted px-1 py-0.5 font-mono text-[0.9em]"
          >
            {text.slice(i + 1, end)}
          </code>,
        )
        i = end + 1
        continue
      }
    }

    const citation = text.slice(i).match(/^\[(\d+)\]/)
    if (citation) {
      flush()
      const n = Number(citation[1])
      const exists = sources.some((s) => s.n === n)
      nodes.push(<CitationPip key={`${keyPrefix}-c-${key++}`} n={n} muted={!exists} />)
      i += citation[0].length
      continue
    }

    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1)
      if (end !== -1) {
        flush()
        nodes.push(
          <em key={`${keyPrefix}-i-${key++}`} className="italic">
            {renderInlineMarkdown(text.slice(i + 1, end), sources, `${keyPrefix}-i-${key}`)}
          </em>,
        )
        i = end + 1
        continue
      }
    }

    buffer += text[i]
    i += 1
  }

  flush()
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
        Answered by <span className="font-medium text-foreground/80">Radioso</span> · grounded
        in this site&apos;s knowledge base
      </span>
    </div>
  )
}
