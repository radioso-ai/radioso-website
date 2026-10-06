import type { PlanSpriteKey } from '@/components/pixel-sprite'
import { site } from '@/lib/site'

/**
 * The plan ladder, in one place — the pricing page and the agent's canned
 * pricing answer both read from here so they cannot drift apart.
 *
 * The unit is a conversation, and the ladder is graded by two things: how many
 * conversations a month, and who pays for the models. Comet: the models are on
 * us, hence the ceiling. Satellite: metered through us. Planet: volume, on your
 * own keys and rates. Say that wherever the plans appear, or Planet reads as the
 * expensive tier that takes something away.
 *
 * Numbers approved 2026-09-07, refined 2026-09-14 (conversation definition,
 * top-up packs, Satellite raised from €99 to €149, storage limits) and
 * 2026-09-15 after the CFO review (packs off Comet, 12-month pack expiry,
 * Ray and test runs at half a conversation). Reconciled 2026-10-05 against
 * ee/packages/plan-catalog/src/plans.json, which is what billing enforces:
 * unbuilt promises removed, Comet storage and the managed model corrected.
 * Change them here and nowhere else, and keep them equal to the catalog.
 */

/** A conversation is up to this many agent replies. Longer ones count again. */
export const REPLIES_PER_CONVERSATION = 10

/**
 * What counts against the monthly allowance, in conversations. One unit,
 * everything counts, most things count for very little. There are deliberately
 * no model multipliers: managed plans run one model, and on Planet the
 * customer's own provider bill is the multiplier.
 */
export const MANAGED_ANSWER_MODEL = 'OpenAI GPT-5.4 mini'

export const COUNTS_AS: { what: string; counts: number }[] = [
  { what: `A customer conversation, up to ${REPLIES_PER_CONVERSATION} replies`, counts: 1 },
  { what: 'A message to Ray, the operator copilot', counts: 0.5 },
  { what: 'A test run in Workbench or evals', counts: 0.5 },
  { what: 'An on-demand Audience Pulse report', counts: 10 },
  { what: 'Publishing routines, crawling, indexing', counts: 0 },
]

/**
 * The managed service. Deliberately not a card, not a plan, and not a listed
 * price: it is us running the agent on top of whichever plan the workspace is
 * on, and the shape of that work differs enough per customer that it is priced
 * by agreement. The first customer to pay it was a small publisher on the free
 * plan, which is the point: at that scale the software is free and the service
 * is not.
 */
export const MANAGED = {
  scope: 'We set up your agent, tune it, and review what your visitors asked every month.',
  cta: 'Tell us what you need',
  href: `mailto:${site.contactEmail}?subject=Running%20the%20agent%20for%20us`,
}

/**
 * The tier above Planet. Named so a buyer at 20,000 a month knows the ladder
 * keeps going, but deliberately not a fourth card: no price, no feature list to
 * promise, and above 5,000 it is a conversation, not a checkout. Rendered as a
 * slim strip with the same anatomy as Own Galaxy: name, label, one line, one
 * action.
 */
export const STAR = {
  name: 'Star',
  label: 'by agreement',
  sprite: 'star' as PlanSpriteKey,
  threshold: '5,000',
  text: 'More than 5,000 conversations a month, on your keys or ours.',
  cta: 'Talk to us',
  href: `mailto:${site.contactEmail}?subject=Star%3A%20more%20than%205%2C000%20conversations%20a%20month`,
}

/**
 * Prepaid top-up, on the paid plans only. Not on Comet: with packs, Comet plus
 * three of them undercuts Satellite for anyone under ~950 conversations a
 * month, which is most of the customers Satellite exists for. Packs last a
 * year rather than forever so they stay a bridge and not a plan. The 12-month term is the term of
 * sale; enforcement lands in radioso#1419 before the first pack can expire.
 * A bullet on both paid cards; expiry is explained once in the details below.
 */
export const TOP_UP = {
  price: '€50',
  conversations: 300,
  note: 'One-off, no subscription. Lasts 12 months.',
}

/** The comparison rows, in the order they render on every card. */
export const FEATURE_ROWS = ['content', 'models', 'seats', 'channels', 'support', 'over'] as const
export type FeatureRow = (typeof FEATURE_ROWS)[number]

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
  /** The allowance, rendered as the first bullet with the link to what a
   *  conversation is. Kept out of `features` so the info icon has one home. */
  conversations: string
  /** Shown under the price on the featured card only: what the year costs. */
  annualNote?: string
  pitch: string
  /** One value per row of FEATURE_ROWS, so the three cards line up and a
   *  reader can compare across a row rather than hunt down each list. */
  rows: Record<FeatureRow, string>
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
    priceNote: 'no card required',
    conversations: '50 conversations a month',
    pitch: 'The whole platform, with the models on us.',
    rows: {
      content: '10 MB of content, about 3,000 pages',
      models: 'Models on us',
      seats: 'Unlimited agents and seats',
      channels: 'Embed, API, SDK, Slack, MCP',
      support: 'Community support',
      over: 'Run over? Move up to Satellite',
    },
    cta: { text: 'Start free', href: site.appUrl },
  },
  {
    name: 'Satellite',
    label: 'monthly',
    sprite: 'satellite',
    price: '€149',
    priceNote: 'per month · excl. VAT',
    conversations: '1,000 conversations a month',
    annualNote: '€1,490 a year, two months free',
    pitch: 'You pay for conversations, and nothing else.',
    rows: {
      content: '20 MB of content, about 6,000 pages',
      models: 'Models included, no keys to set up',
      seats: 'Unlimited agents and seats',
      channels: 'Embed, API, SDK, Slack, MCP',
      support: 'Email support',
      over: `Run over? ${TOP_UP.price} for ${TOP_UP.conversations} more`,
    },
    cta: { text: 'Start free, upgrade in-app', href: site.appUrl },
    featured: true,
  },
  {
    name: 'Planet',
    label: 'monthly',
    sprite: 'planet',
    price: '€499',
    priceNote: 'per month · your model keys · excl. VAT',
    conversations: '5,000 conversations a month',
    annualNote: '€4,990 a year, two months free',
    pitch: 'Five times the volume, on your own model keys and rates.',
    rows: {
      content: '100 MB of content, about 30,000 pages',
      models: 'Bring your own model keys',
      seats: 'Unlimited agents and seats',
      channels: 'Embed, API, SDK, Slack, MCP',
      support: 'Priority support and a quarterly review',
      over: `Run over? ${TOP_UP.price} for ${TOP_UP.conversations} more`,
    },
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
  body: 'Every product feature is open source: grounded answers, directives, routines, actions, every channel. Run it on your own infrastructure with your own model keys, and nothing routes through us. There is no conversation limit and no markup on inference.',
  // Phrased as a boundary rather than a missing feature: for a single company
  // self-hosting, one organization is simply not a topic.
  boundary:
    'One organization per install, which covers any company hosting for itself. Running many separate organizations off a single deployment is reserved for the Enterprise Edition.',
  ctas: [
    { text: 'Get the source', href: site.githubUrl },
    { text: 'Read the setup guide', href: `${site.docsUrl}/quickstarts/run-locally` },
  ],
}
