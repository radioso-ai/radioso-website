/**
 * Dummy agent layer.
 *
 * Pre-rendered answers below are placeholders — they pretend to be Radioso responses so the
 * page UX can be designed and verified before wiring the real grounded API. Once an endpoint
 * + token is provided, swap `fetchAnswer()` to call it and replace the canned `answers` map
 * with build-time fetches (ISR) for pre-rendered sections.
 */

export type AgentSource = {
  n: number
  title: string
  detail: string
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
  pricing: { title: 'docs/editions.md', detail: '§ OSS vs Enterprise' },
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
      { n: 2, ...RADIOSO_SOURCES.pricing },
    ],
  },
  pricing: {
    body:
      "The core platform is open source and free to self-host[1]. Enterprise Edition adds additional operator controls and support; pricing is engagement-based[2]. You bring your own model keys either way — Radioso doesn't mark up inference[3].",
    sources: [
      { n: 1, ...RADIOSO_SOURCES.pricing },
      { n: 2, ...RADIOSO_SOURCES.embed },
      { n: 3, ...RADIOSO_SOURCES.readme },
    ],
  },
  refuse: {
    body:
      "I can't find that in the sources I'm grounded on. Try asking about Radioso's ingestion, retrieval, deployment, MCP integration, or pricing — or check the docs for topics outside that scope.",
    sources: [],
  },
}

/**
 * Tiny intent router for the dummy one-shot input. Returns a canned answer based on the
 * question — swap with a real grounded call once the endpoint is available.
 */
export async function fetchAnswer(question: string): Promise<AgentAnswerData> {
  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500))

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
