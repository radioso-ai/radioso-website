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

import { site } from '@/lib/site'

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

/**
 * Every entry must be a page that exists and that actually covers the claim citing it.
 * A fabricated citation on a product whose whole pitch is "grounded, with citations" is
 * the one error worth being paranoid about — verify the page before adding it here.
 */
const RADIOSO_SOURCES = {
  why: { title: 'Why Radioso', url: `${site.docsUrl}/why-radioso` },
  grounded: { title: 'Grounded answers', url: `${site.docsUrl}/why-radioso/grounded-answers` },
  architecture: { title: 'Architecture', url: `${site.docsUrl}/architecture` },
  retrieval: { title: 'Retrieval pipeline', url: `${site.docsUrl}/architecture/retrieval-pipeline` },
  deployment: { title: 'Deployment', url: `${site.docsUrl}/operators/deployment` },
  runLocally: { title: 'Run locally', url: `${site.docsUrl}/quickstarts/run-locally` },
  embed: { title: 'Website embed', url: `${site.docsUrl}/quickstarts/website-embed` },
  source: { title: 'github.com/radioso-ai', url: site.githubUrl },
} satisfies Record<string, Omit<AgentSource, 'n'>>

export const PRERENDERED: Record<string, AgentAnswerData> = {
  whatIsRadioso: {
    body:
      "Radioso is a platform for self-hosted conversational agents — grounded in your data and following your rules[1]. An agent talks to your users, follows the procedures you author, and takes real action rather than just describing it[1]. It answers from your own content and cites what it used, so you can check it[2]. One deployment serves every surface: the web app, a REST API, a TypeScript SDK, a website embed, Slack, and MCP clients[3]. Your data and your model keys stay in your stack[4].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.why },
      { n: 2, ...RADIOSO_SOURCES.grounded },
      { n: 3, ...RADIOSO_SOURCES.architecture },
      { n: 4, ...RADIOSO_SOURCES.deployment },
    ],
  },
  whyNotLangchain: {
    body:
      "Frameworks like LangChain hand you primitives — you still assemble ingestion, retrieval, an agent runtime, a chat UI, an API, and the operator tooling yourself[1]. Radioso ships that as one product: agents that answer from your content, follow directives and routines you author as data, and take action — tunable without a redeploy[1]. The trade is flexibility for time-to-value. If you need a bespoke agent topology, build it on a framework; if you need a grounded agent your team can run this week, run Radioso[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.why },
      { n: 2, ...RADIOSO_SOURCES.runLocally },
    ],
  },
  actions: {
    body:
      "Yes — acting is the default, not an add-on. Radioso agents run multi-step routines across turns: you write the steps in plain language, drop in a chip to collect a value, call a tool, or branch, and the engine compiles it and resumes it turn to turn — no redeploy[1]. A routine can fire a webhook when it finishes, and every step — which directive steered it, which tool it called, which routine step it's on — lands in the same turn trace as the answers, so you can see why it did what it did[1]. Those turns run in the live request path, so the agent acts inside the conversation instead of handing you a background job to poll[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.why },
      { n: 2, ...RADIOSO_SOURCES.architecture },
    ],
  },
  handoff: {
    body:
      "Yes. When your rules say a person decides — or the agent hits something it shouldn't settle alone — it stops and hands the conversation to a real person, with the full transcript and every action it already took attached[1]. The built-in contact-a-human flow is itself just a routine — collect an email, collect a message, submit, confirm — so you can edit it like any other one[1]. It also won't paper over a gap to avoid the handoff: with no supporting evidence it says so rather than sounding confident[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.why },
      { n: 2, ...RADIOSO_SOURCES.grounded },
    ],
  },
  selfHosting: {
    body:
      "Yes — that's the default. Radioso runs end to end on your own hardware with Docker Compose, or on Cloud Run for a managed deploy[1][2]. Postgres is the system of record: application state, documents, chunks, and vectors all live there, and uploaded files sit on your own filesystem or object storage[2]. Bring your own keys for OpenAI, Anthropic, Gemini, or any OpenAI-compatible endpoint — nothing has to route through a service we control[1].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.deployment },
      { n: 2, ...RADIOSO_SOURCES.runLocally },
    ],
  },
  mcp: {
    body:
      "Radioso speaks MCP. Self-hosted, the backend can serve an MCP endpoint directly; there's also a standalone `@radioso/mcp-server` package when you want MCP as its own connector surface[1]. Clients get both shapes: tools to converse with an agent, and tools to search, read, and write workspace documents — with citations attached[1]. It runs the same retrieval and the same rules as every other surface, so answers stay consistent[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.why },
      { n: 2, ...RADIOSO_SOURCES.architecture },
    ],
  },
  embed: {
    body:
      "The website embed is one script tag on an approved origin — it opens a Radioso-hosted chat with no backend work on the host site, and origin policy stays with you[1]. It's one surface among several on the same deployment, alongside the web app, REST API, TypeScript SDK, Slack, and MCP[2].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.embed },
      { n: 2, ...RADIOSO_SOURCES.why },
    ],
  },
  licensing: {
    body:
      "Every product feature is open source — grounded answers, directives, routines, actions, every surface. Nothing is feature-gated and nothing is held back for a paid tier[1]. You self-host on your own infrastructure and bring your own model keys, so nothing routes through us and there's no markup on inference[2]. Enterprise Edition exists only for multi-tenant deployments running Radioso at scale — tell us what yours needs and we'll work out the shape of it together.",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.source },
      { n: 2, ...RADIOSO_SOURCES.deployment },
    ],
  },
  refuse: {
    body:
      "I can't find that in the sources I'm grounded on. Try asking about Radioso's agents, grounded answers and citations, routines and actions, handing off to a person, the surfaces it runs on, self-hosting, or licensing — or check the docs for anything outside that.",
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
    [/\bprice|pricing|cost|free|paid|licen[cs]|open[- ]?source|enterprise\b/, 'licensing'],
    [/\blangchain|framework|low[- ]?code|compare|vs\b/, 'whyNotLangchain'],
    [/\bwhat( is|'s) radioso|what does radioso|tldr\b/, 'whatIsRadioso'],
    // Last on purpose. Both patterns below are deliberately broad, so they sit behind the
    // surface, licensing, and comparison intents: "call a tool over MCP", "what do actions
    // cost", and "how do routines compare to LangChain" keep their existing routes, and
    // these two only pick up questions that would otherwise fall through to `refuse`.
    [
      /\baction|\bacts?\b|routine|\btools?\b|webhook|automat|\bapi call|just a (chat ?)?bot|chat ?bot\b|\bdo (things|stuff|anything)\b/,
      'actions',
    ],
    [
      /hand[- ]?off|hand(s|ed)? (it |the conversation )?(off|over)|handover|escalat|\bhumans?\b|\breal person\b|\bperson\b|talk to (a |an )?(agent|rep)/,
      'handoff',
    ],
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
