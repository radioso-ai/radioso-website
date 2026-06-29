/**
 * Agent layer.
 *
 * `fetchAnswer()` calls the live Radioso grounded API through the headless embed token
 * (session exchange → public chat message). The public session is reused across asks, and the
 * `conversationId` returned by the first answer is fed back into later asks so follow-ups
 * continue the same conversation instead of starting fresh. Answers stream over SSE: text
 * arrives incrementally via `onChunk`, and the final `done` event carries the cited payload.
 *
 * If the live call is unavailable — local dev, an origin not yet on the workspace allowlist,
 * or the message CORS not yet deployed — it falls back to the canned `PRERENDERED` answers so
 * the page never shows a broken state.
 *
 * The pre-rendered seed answer (hero "What is Radioso?") stays canned because the page is a
 * static export; live answers happen client-side once a visitor asks.
 */

export type AgentSource = {
  n: number
  title: string
  detail?: string
  url?: string
}

export type AgentAnswerData = {
  /** Body text with [n] markers where citation pips should render. */
  body: string
  sources: AgentSource[]
  /** Surface where the bot was asked, for the "answered by" attribution chip. */
  surface?: string
}

const RADIOSO_SOURCES = {
  readme: { title: 'readme.md', detail: 'Quick Start' },
  architecture: { title: 'docs/architecture.md', detail: '§ Surfaces' },
  mcp: { title: 'docs/mcp.md', detail: '§ Server setup' },
  retrieval: { title: 'docs/retrieval.md', detail: '§ pgvector' },
  selfHost: { title: 'docs/deployment.md', detail: '§ Self-hosting' },
  embed: { title: 'docs/embed.md', detail: '§ Website embed' },
  pricing: { title: 'docs/pricing.md', detail: '§ Licensing & pricing' },
} satisfies Record<string, Omit<AgentSource, 'n'>>

export const PRERENDERED: Record<string, AgentAnswerData> = {
  whatIsRadioso: {
    body:
      "Radioso is a self-hosted context platform for grounded assistants. You upload your documents and Radioso parses, chunks, and embeds them into Postgres with pgvector[1]. From there, one backend powers a web chat, a REST API, a TypeScript SDK, a website embed, and an MCP server — so the same grounded answers reach your end users and your tools[2]. The data and the model keys stay in your stack[3].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.retrieval },
      { n: 2, ...RADIOSO_SOURCES.architecture },
      { n: 3, ...RADIOSO_SOURCES.selfHost },
    ],
  },
  whyNotLangchain: {
    body:
      "Frameworks like LangChain give you primitives — you still have to assemble ingestion, retrieval, an agent runtime, a chat UI, an API, and an MCP server yourself[1]. Radioso ships those as one product, pre-wired, with sane defaults you can tune from the operator UI[2]. The trade is flexibility for time-to-value: if you need a one-off custom agent topology, build it on a framework; if you need a grounded assistant your team can ship this week, run Radioso[3].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.architecture },
      { n: 2, ...RADIOSO_SOURCES.retrieval },
      { n: 3, ...RADIOSO_SOURCES.readme },
    ],
  },
  selfHosting: {
    body:
      "Yes. Radioso runs end-to-end on your hardware via Docker Compose, or on Cloud Run for managed deploys[1]. Postgres with pgvector is the system of record — application state, documents, chunks, and vectors all live there[2]. Bring your own OpenAI, Anthropic, or Gemini keys; nothing routes through a Radioso-controlled service[3].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.selfHost },
      { n: 2, ...RADIOSO_SOURCES.retrieval },
      { n: 3, ...RADIOSO_SOURCES.readme },
    ],
  },
  mcp: {
    body:
      "Radioso ships a standalone MCP server in `packages/radioso-mcp-server`[1]. Point Cursor, Claude Desktop, or any MCP-capable client at it and your knowledge base becomes a tool the model can call — with citations attached to every result[2]. The MCP surface uses the same retrieval pipeline as the web chat, so answers stay consistent across surfaces[3].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.mcp },
      { n: 2, ...RADIOSO_SOURCES.retrieval },
      { n: 3, ...RADIOSO_SOURCES.architecture },
    ],
  },
  embed: {
    body:
      "The website embed is one script tag on an approved origin — it opens a Radioso-hosted chat iframe with no backend work on the host site, and origin policy stays with you[1]. It's available everywhere, alongside the web app, REST API, SDK, and MCP server[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.embed },
      { n: 2, ...RADIOSO_SOURCES.architecture },
    ],
  },
  pricing: {
    body:
      "Radioso is self-hosted: you run it on your own infrastructure and bring your own OpenAI, Anthropic, or Gemini keys, so nothing routes through us and there's no markup on inference[1]. We're still settling licensing and pricing with our first customers — reach out and we'll work something out for your team[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.readme },
      { n: 2, ...RADIOSO_SOURCES.pricing },
    ],
  },
  refuse: {
    body:
      "I can't find that in the sources I'm grounded on. Try asking about Radioso's ingestion, retrieval, deployment, MCP integration, or pricing — or check the docs for topics outside that scope.",
    sources: [],
  },
}

/* ------------------------------------------------------------------ *
 * Stub fallback — canned answers for local dev and whenever the live
 * API is unreachable. Keyed by a tiny intent router over the question.
 * ------------------------------------------------------------------ */
async function stubAnswer(question: string): Promise<AgentAnswerData> {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))

  const q = question.toLowerCase().trim()
  if (!q) return PRERENDERED.refuse

  const matches: [RegExp, keyof typeof PRERENDERED][] = [
    [/\bself[- ]?host|deploy|docker|cloud run\b/, 'selfHosting'],
    [/\bmcp|cursor|claude desktop|chatgpt\b/, 'mcp'],
    [/\bembed|widget|iframe\b/, 'embed'],
    [/\bprice|pricing|cost|free|paid|enterprise\b/, 'pricing'],
    [/\blangchain|framework|low[- ]?code|compare|vs\b/, 'whyNotLangchain'],
    [/\bwhat( is|'s) radioso|what does radioso|tldr\b/, 'whatIsRadioso'],
  ]

  for (const [pattern, key] of matches) {
    if (pattern.test(q)) return PRERENDERED[key]
  }
  return PRERENDERED.refuse
}

/* ------------------------------------------------------------------ *
 * Live grounded API — Radioso public chat via the headless embed token.
 * Exchange the embed token for a public session (cached), then post the
 * question. Configurable via NEXT_PUBLIC_RADIOSO_* (inlined at build).
 * ------------------------------------------------------------------ */
const API_BASE = process.env.NEXT_PUBLIC_RADIOSO_API_BASE ?? 'https://app.radioso.ai'
const EMBED_TOKEN = process.env.NEXT_PUBLIC_RADIOSO_EMBED_TOKEN ?? '6teSuTrkFZGiKOyPMWoJCA'

let sessionTokenPromise: Promise<string> | null = null

/**
 * Conversation continuity. Captured from the first live answer and sent back on every
 * subsequent ask so the backend continues the same conversation (with memory) instead of
 * opening a new one each time. Resets on a full page load — one thread per page visit.
 */
let conversationId: string | null = null

async function ensureSessionToken(): Promise<string> {
  if (!sessionTokenPromise) {
    sessionTokenPromise = (async () => {
      const res = await fetch(
        `${API_BASE}/api/embed/session/${encodeURIComponent(EMBED_TOKEN)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      )
      if (!res.ok) throw new Error(`session ${res.status}`)
      const data: unknown = await res.json()
      const token =
        typeof data === 'object' && data !== null
          ? (data as { publicSessionToken?: unknown }).publicSessionToken
          : undefined
      if (typeof token !== 'string' || !token) throw new Error('missing session token')
      return token
    })().catch((err) => {
      sessionTokenPromise = null // let the next ask retry the exchange
      throw err
    })
  }
  return sessionTokenPromise
}

type RawCitation = { title?: string; sourceUrl?: string | null }
type RawSegment = { text?: string; citationIndices?: number[] }
type RawAnswer = {
  conversationId?: string
  answer?: string
  citations?: RawCitation[]
  answerSegments?: RawSegment[]
}

function mapAnswer(raw: RawAnswer): AgentAnswerData {
  const citations = Array.isArray(raw.citations) ? raw.citations : []
  const sources: AgentSource[] = citations.map((c, i) => ({
    n: i + 1,
    title: c.title?.trim() || `Source ${i + 1}`,
    url: c.sourceUrl ?? undefined,
  }))

  let body = ''
  if (Array.isArray(raw.answerSegments) && raw.answerSegments.length > 0) {
    for (const seg of raw.answerSegments) {
      body += seg.text ?? ''
      for (const idx of seg.citationIndices ?? []) body += `[${idx + 1}]`
    }
  } else {
    body = raw.answer ?? ''
  }

  return { body: body.trim(), sources }
}

export type FetchAnswerOptions = {
  /** Called with the full text accumulated so far as each stream chunk arrives. */
  onChunk?: (partialBody: string) => void
}

export async function fetchAnswer(
  question: string,
  opts: FetchAnswerOptions = {},
): Promise<AgentAnswerData> {
  const q = question.trim()
  if (!q) return PRERENDERED.refuse
  if (!EMBED_TOKEN) return stubAnswer(q)

  try {
    const sessionToken = await ensureSessionToken()
    const res = await fetch(`${API_BASE}/api/public/chat/${encodeURIComponent(EMBED_TOKEN)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Radioso-Public-Session': sessionToken,
      },
      body: JSON.stringify(
        conversationId
          ? { message: q, conversationId, startConversation: false, stream: true }
          : { message: q, startConversation: true, stream: true },
      ),
    })
    if (!res.ok || !res.body) throw new Error(`chat ${res.status}`)
    const mapped = await readAnswerStream(res.body, opts.onChunk)
    if (!mapped.body) throw new Error('empty answer')
    return mapped
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[radioso] live answer unavailable, using fallback:', err)
    }
    return stubAnswer(q)
  }
}

/**
 * Parse the Radioso SSE chat stream. Events: `conversation` (carries the id), `chunk`
 * (incremental `{ text }`), `done` (the full cited payload), and `suggestions` (ignored).
 * Accumulated text is pushed through `onChunk`; the `done` payload is authoritative for the
 * final answer (citation markers + sources) and commits the conversation id.
 */
async function readAnswerStream(
  body: ReadableStream<Uint8Array>,
  onChunk?: (partialBody: string) => void,
): Promise<AgentAnswerData> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let acc = ''
  // Held on an object so the closure assignment below survives TS control-flow narrowing.
  const state: { final: RawAnswer | null } = { final: null }

  const dispatch = (event: string, data: string) => {
    if (!data) return
    let payload: unknown
    try {
      payload = JSON.parse(data)
    } catch {
      return
    }
    if (event === 'chunk') {
      const text = (payload as { text?: unknown }).text
      if (typeof text === 'string') {
        acc += text
        onChunk?.(acc)
      }
    } else if (event === 'done') {
      state.final = payload as RawAnswer
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      let event = 'message'
      const dataLines: string[] = []
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''))
      }
      dispatch(event, dataLines.join('\n'))
    }
  }

  if (state.final) {
    if (typeof state.final.conversationId === 'string') conversationId = state.final.conversationId
    return mapAnswer(state.final)
  }
  // Stream ended without a `done` event — surface whatever text we accumulated.
  return { body: acc.trim(), sources: [] }
}
