import type { PlanSpriteKey } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

/**
 * The plan ladder, in one place — the pricing page and the agent's canned
 * pricing answer both read from here so they cannot drift apart.
 *
 * The unit is a conversation, and the ladder is graded by two things: how many
 * conversations a month, and who pays for the models. Comet: the models are on
 * us, hence the ceiling. Satellite: metered through us. Planet: your own keys,
 * your own rates. Say that wherever the plans appear, or Planet reads as the
 * expensive tier that takes something away.
 *
 * Numbers approved 2026-09-07, refined 2026-09-14 (conversation definition,
 * top-up packs, Satellite raised from €99 to €149, storage limits). Change them
 * here and nowhere else.
 */

/** A conversation is up to this many agent replies. Longer ones count again. */
export const REPLIES_PER_CONVERSATION = 10

/**
 * What counts against the monthly allowance, in conversations. One unit,
 * everything counts, most things count for very little. There are deliberately
 * no model multipliers: managed plans run one model, and on Planet the
 * customer's own provider bill is the multiplier.
 */
export const MANAGED_ANSWER_MODEL = 'Claude Sonnet 5'

export const COUNTS_AS: { what: string; counts: number }[] = [
  { what: `A customer conversation, up to ${REPLIES_PER_CONVERSATION} replies`, counts: 1 },
  { what: 'A message to Ray, the operator copilot', counts: 1 },
  { what: '10 test runs in Workbench or evals', counts: 1 },
  { what: 'An on-demand Audience Pulse report', counts: 10 },
  { what: 'The scheduled monthly Pulse report, publishing routines, crawling, indexing', counts: 0 },
]

/** Prepaid top-up, available on every cloud plan including the free one. */
export const TOP_UP = {
  price: '€50',
  conversations: 300,
  note: 'One-off, no subscription. Never expires.',
}

export type CloudPlan = {
  /** Product name. Always rendered next to `label` — the name alone makes a
   *  stranger learn our vocabulary before they can compare tiers. */
  name: string
  label: string
  /** Key into PLAN_SPRITES. Kept as a string so this data module stays free of
   *  component imports. */
  sprite: PlanSpriteKey
  price: string
  priceNote: string
  /** Shown under the price on the featured card only: what the year costs. */
  annualNote?: string
  pitch: string
  features: string[]
  cta: { text: string; href: string }
  /** Exactly one plan is featured; it gets `.panel` instead of `.surface`. */
  featured?: boolean
}

export const CLOUD_PLANS: CloudPlan[] = [
  {
    name: 'Comet',
    label: 'free',
    sprite: 'comet',
    price: 'Free',
    priceNote: '100 conversations a month · no card required',
    pitch: 'The whole platform, with the models on us. That is why there is a ceiling.',
    features: [
      '100 conversations a month',
      '10 MB of content, about 3,000 pages',
      'Every product feature',
      'Unlimited agents and seats',
      'Every surface: embed, API, SDK, Slack, MCP',
      'Community support',
      `Top up any time: ${TOP_UP.price} for ${TOP_UP.conversations} more`,
    ],
    cta: { text: 'Start free', href: site.appUrl },
  },
  {
    name: 'Satellite',
    label: 'monthly',
    sprite: 'satellite',
    price: '€149',
    priceNote: 'per month · 1,000 conversations',
    annualNote: '€1,490 a year, two months free',
    pitch: 'You pay for conversations, and nothing else. Not seats, and not resolutions.',
    features: [
      '1,000 conversations a month',
      '50 MB of content, about 15,000 pages',
      'Models included, no keys to set up',
      'Unlimited agents and seats',
      'Every surface: embed, API, SDK, Slack, MCP',
      'Email support',
      `Top up any time: ${TOP_UP.price} for ${TOP_UP.conversations} more`,
    ],
    cta: { text: 'Start free, upgrade in-app', href: site.appUrl },
    featured: true,
  },
  {
    name: 'Planet',
    label: 'monthly',
    sprite: 'planet',
    price: '€499',
    priceNote: 'per month · 10,000 conversations',
    annualNote: '€4,990 a year, two months free',
    pitch: 'Your model keys, your rates, your provider agreements. We run the platform.',
    features: [
      '10,000 conversations a month',
      '250 MB of content, about 80,000 pages',
      'Bring your own model keys',
      'Unlimited agents and seats',
      'Every surface: embed, API, SDK, Slack, MCP',
      'Priority support',
      'A quarterly review of what your visitors ask',
    ],
    cta: { text: 'Start free, upgrade in-app', href: site.appUrl },
  },
]

/**
 * The self-hosted tier. Deliberately not a fourth card: it is a deployment mode,
 * not a price point, and four-across both crowds the row and makes self-host
 * compete with Satellite for the primary decision.
 */
export const SELF_HOSTED = {
  name: 'Own Galaxy',
  label: 'self-hosted',
  sprite: 'galaxy' as PlanSpriteKey,
  title: 'Or take the whole thing in-house.',
  body: 'Every product feature is open source: grounded answers, directives, routines, actions, every surface. Run it on your own infrastructure with your own model keys. Nothing routes through us, there is no conversation limit, and there is no markup on inference.',
  // Phrased as a boundary rather than a missing feature: for a single company
  // self-hosting, one organization is simply not a topic.
  boundary:
    'One organization per install, which is every self-hoster. Running many separate organizations off a single deployment is the one thing reserved for the Enterprise Edition.',
  ctas: [
    { text: 'Get the source', href: site.githubUrl },
    { text: 'Read the setup guide', href: `${site.docsUrl}/quickstarts/run-locally` },
  ],
}
