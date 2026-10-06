import {
  CLOUD_PLANS,
  COUNTS_AS,
  MANAGED,
  MANAGED_ANSWER_MODEL,
  REPLIES_PER_CONVERSATION,
  SELF_HOSTED,
  STAR,
  TOP_UP,
} from '@/lib/pricing'
import { site } from '@/lib/site'

/**
 * The commercial facts as plain markdown, generated from `lib/pricing.ts`.
 *
 * This exists so the agent behind the site's Ask box can be grounded in the
 * same numbers the page shows, by crawling one URL rather than by someone
 * remembering to re-upload a document. Point the workspace's website crawler
 * at `/pricing.md` and it re-ingests whenever the site deploys; the numbers
 * cannot drift from the page because both read this module.
 *
 * Static export emits this as a file in `out/`, so Firebase serves it like any
 * other asset.
 */
export const dynamic = 'force-static'

/** Lowercase only the first letter, so "10 MB" and "Slack" survive. */
const lead = (value: string) => value.charAt(0).toLowerCase() + value.slice(1)

const plan = (p: (typeof CLOUD_PLANS)[number]) => {
  const price =
    p.price === 'Free'
      ? 'is free'
      : `costs ${p.price} a month${p.annualNote ? `, or ${p.annualNote.replace(' a year, two months free', ' a year (two months free)')}` : ''}`
  return [
    `### ${p.name}`,
    '',
    `${p.name} ${price}. It includes ${lead(p.conversations)} and ${lead(p.rows.content)}, with ${lead(p.rows.seats)}, every channel (website embed, REST API, TypeScript SDK, Slack, MCP), and ${lead(p.rows.support)}.`,
    '',
    `Models: ${lead(p.rows.models)}. Over the limit: ${lead(p.rows.over.replace('Run over? ', ''))}.`,
  ].join('\n')
}

export function GET() {
  const body = `# Radioso plans and pricing

Generated from the pricing page at ${site.url}/pricing. These are the current
commercial facts for Radioso Cloud and the open-source edition.

## Plans on Radioso Cloud

Radioso Cloud is priced on conversations. There are no per-seat fees and no
per-resolution fees. Every product feature is available on every plan,
including the free one. Listed prices exclude VAT.

${CLOUD_PLANS.map(plan).join('\n\n')}

### ${STAR.name}

${STAR.name} is the tier above ${CLOUD_PLANS[CLOUD_PLANS.length - 1].name}, ${STAR.label}: ${STAR.text} There is no self-serve checkout for ${STAR.name}; email ${site.contactEmail}.

### Top-ups

On the paid plans you can buy ${TOP_UP.conversations} additional conversations for ${TOP_UP.price}. ${TOP_UP.note} Top-ups are not available on the free plan; the next step from there is ${CLOUD_PLANS[1].name}.

### Managed service

${MANAGED.scope} It is priced by agreement, on top of any plan including the free one, and there is no listed price. It is a service, not a software tier: the software is the same. To arrange it, email ${site.contactEmail}.

## What counts as a conversation

A conversation is one person talking to one agent, up to ${REPLIES_PER_CONVERSATION} agent replies. Retrieval, tool calls, and the internal steps of a routine are not counted separately: a routine that takes six internal steps to produce one reply is still one reply. A conversation that runs past ${REPLIES_PER_CONVERSATION} replies counts as another conversation for each further ${REPLIES_PER_CONVERSATION}.

An operator's own work with the agent also counts against the monthly allowance, lightly:

${COUNTS_AS.map((r) => `- ${r.what}: ${r.counts}`).join('\n')}

Every line appears in the workspace usage view.

## Which model answers

The plans where the models run on Radioso's keys use ${MANAGED_ANSWER_MODEL} for answers, with smaller models for the steps around it (query rewriting, reranking, classification). There are no model multipliers and no credit tables. ${CLOUD_PLANS[CLOUD_PLANS.length - 1].name} runs on the customer's own model keys with any model they choose; the platform price is the same and the customer pays their model provider directly.

## Content storage

Storage counts the text of the documents and pages given to the agent. A typical product page or help article is around 3 KB. Embeddings and the search index do not count. At the storage limit, new uploads pause until content is removed or the workspace moves up a plan, and nothing already indexed is deleted.

## What happens at the limit

The dashboard warns at 80 percent of the monthly limit. At the limit, the workspace can move up a plan, or on the paid plans buy a top-up. Nothing is charged without the customer asking, and there is no overage bill at the end of the month.

Unused monthly conversations do not roll over; the allowance resets on the billing date, on monthly and annual plans alike. Conversations in a top-up pack stay available for 12 months from purchase.

## Self-hosting (${SELF_HOSTED.name})

${SELF_HOSTED.body}

${SELF_HOSTED.boundary}

Radioso Cloud and the self-hosted release are the same open-source code. The cloud is Radioso running the servers, not a different product, and you can move between them in either direction.

## Do I need the Enterprise Edition to self-host?

No. Every product feature is in the open-source release, and a self-hosted install runs on your own model keys with no conversation limit.

The Enterprise Edition is the commercial layer behind Radioso Cloud: plans, billing, usage limits, and running many separate organizations from a single deployment. A company self-hosting Radioso for its own use is one organization and needs none of it. Nothing in the Enterprise Edition is a product feature that self-hosters or cloud customers are missing.

## Is anything gated behind a paid plan?

No. Every product feature is available on the free plan, on every paid plan, and in the open-source release. Plans differ only in the number of conversations per month, the amount of content, who pays for the models, and the level of support.

Usage limits on Radioso Cloud are volume limits, not feature gates. A \`usage_limit_exceeded\` response means the workspace has used its monthly conversations; the answer is to move up a plan or buy a top-up, and no feature is being withheld.

## How to get started

Create a workspace at ${site.appUrl}. The free plan needs no card. To self-host, follow ${site.docsUrl}/quickstarts/run-locally. To talk to the team, email ${site.contactEmail}.

## Company

Radioso is built and operated by Ljuv OÜ, an Estonian company in Tallinn. Radioso Cloud is hosted on Google Cloud in the EU (europe-west), and analytics run on PostHog's EU cloud.
`
  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
}
