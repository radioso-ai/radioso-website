// Keeps the support agent on radioso.ai grounded in the current prices.
//
// The agent's workspace learns the product from the docs portal, which the radioso repo
// imports on every push. Prices live here, in lib/pricing.ts, and reach the agent only as
// the generated /pricing.md. A one-off upload of that page went stale: in November 2026
// the agent quoted Comet and Satellite from it but had no price for Planet, a month after
// the page gained one. So every deploy of main now upserts the built out/pricing.md as a
// workspace document.
//
// Same API and upsert as the radioso docs importer (POST /api/v1/document keyed by
// externalDocumentId; unchanged content is skipped). The document carries its own
// metadata.section, so the importer's --prune, which deletes only the sections it
// imports, never touches it.
//
//   RADIOSO_API_TOKEN   workspace API token; without it the script skips and exits 0
//   RADIOSO_BASE_URL    default https://app.radioso.ai/backend
//   SITE_URL            default https://radioso.ai
//
// Run after `pnpm run build`: node scripts/sync-pricing-to-radioso.mjs [--dry-run]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const token = process.env.RADIOSO_API_TOKEN
const baseUrl = (process.env.RADIOSO_BASE_URL || 'https://app.radioso.ai/backend').replace(/\/+$/, '')
const siteUrl = (process.env.SITE_URL || 'https://radioso.ai').replace(/\/+$/, '')

const EXTERNAL_ID = 'radioso-website:pricing.md'
const SECTION = 'radioso-website'

const file = path.join(root, 'out', 'pricing.md')
if (!fs.existsSync(file)) {
  console.error(`::error::${path.relative(root, file)} not found. Run the build first.`)
  process.exit(1)
}

const content = fs.readFileSync(file, 'utf8')
const title = content.match(/^# (.+)$/m)?.[1]?.trim()
if (!title) {
  console.error('::error::pricing.md has no top-level heading to use as the document title.')
  process.exit(1)
}

const document = {
  title,
  content,
  externalDocumentId: EXTERNAL_ID,
  // Citations link to the page a visitor reads, not to the markdown.
  metadata: { section: SECTION, url: `${siteUrl}/pricing` },
  source: { kind: 'website', url: siteUrl },
}

if (dryRun) {
  console.log(JSON.stringify({ ...document, content: `${content.slice(0, 200)}…` }, null, 2))
  process.exit(0)
}

if (!token) {
  console.log('::notice::Skipping the pricing sync because RADIOSO_API_TOKEN is not set.')
  process.exit(0)
}

async function request(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`${method} ${pathname} failed: ${response.status} ${response.statusText} ${detail}`.trim())
  }
  return response.json()
}

const result = await request('POST', '/api/v1/document', document)
console.log(`Upserted ${EXTERNAL_ID} as document ${result.documentId} (${result.status}).`)

// A copy uploaded by hand before this sync existed keeps answering with old prices
// until someone deletes it. Name it rather than delete it: removing workspace content
// is an operator's call.
const others = []
let cursor
do {
  const query = new URLSearchParams({ limit: '100' })
  if (cursor) query.set('cursor', cursor)
  const page = await request('GET', `/api/v1/document?${query}`)
  for (const doc of page.documents ?? []) {
    if (doc.externalDocumentId === EXTERNAL_ID) continue
    if (doc.title === title || doc.metadata?.url === `${siteUrl}/pricing`) others.push(doc)
  }
  cursor = page.hasMore && page.nextCursor ? page.nextCursor : undefined
} while (cursor)

for (const doc of others) {
  console.log(
    `::warning::Another pricing document is still in the workspace: "${doc.title ?? '(untitled)'}" (${doc.id}). Delete it so the agent stops citing old prices.`,
  )
}
