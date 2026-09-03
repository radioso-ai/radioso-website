import {
  Building2,
  FileText,
  Users,
  UserCheck,
  Coins,
  Workflow,
  UserSearch,
  Mail,
  Headset,
} from 'lucide-react'

import { planChat, type SceneScript, type Turn } from '@/components/scene-engine'

/* The three demo transcripts. Voice rules for every line of dialogue: no em
   dashes, no semicolons, no value-by-negation, no cutesy slang. The support
   scene is fiction (a company using Radioso); the docs and leads scenes are
   Radioso answering about itself, written as the target the live agent's
   knowledge base is being amended toward. */

/**
 * One ticket, one problem: the invoice does not match the seat count. The agent
 * diagnoses it, asks the customer before touching billing, and hands the credit
 * to a teammate for sign-off before finishing. That's the whole pitch in one
 * scene — it acts, it asks the person a rule names, and a human stays in the
 * loop exactly where the rules put one.
 */
const SUPPORT_CHAT: Turn[] = [
  {
    // The agent opens, and it knows who it's talking to: this is a logged-in
    // customer, and the greeting is the first hint of identity-aware context.
    who: 'radioso',
    think: 420,
    text: 'Hello Maria, how can I help?',
    pause: 640,
  },
  {
    who: 'customer',
    text: "Our invoice doesn't match our seat count. Can you sort it out?",
  },
  {
    who: 'radioso',
    text: 'On it. Let me dig into the account.',
    think: 620,
    // The lookups are quick, overlapping housekeeping — they should feel brisk.
    actionGap: 280,
    actions: [
      { icon: Building2, label: 'Pulled account · Acme Inc — Pro, 24 seats' },
      { icon: Users, label: 'Checked active users · 18 of 24' },
      { icon: FileText, label: 'Checked billing policy · billing.md' },
    ],
    pause: 520,
  },
  {
    who: 'radioso',
    // The reasoning beat gets the longest think of the scene.
    think: 800,
    text: "Found it. You're paying for 24 seats but only 18 are active. I can right-size the plan and credit the unused seats, $312 this cycle. Want me to go ahead?",
    pause: 760,
  },
  { who: 'customer', text: 'Yes please, go ahead 🙏', pause: 520 },
  {
    who: 'radioso',
    text: 'A credit that size needs a sign-off from the team. One moment.',
    think: 620,
    // The heart of the scene: handoff, approval, execution, one row at a time.
    actionGap: 720,
    actions: [
      { icon: Headset, label: 'Handed to Jonas · full conversation attached' },
      { icon: UserCheck, label: 'Jonas approved · credit unused seats' },
      { icon: Users, label: 'Right-sized plan · 24 → 18 seats' },
      { icon: Coins, label: 'Credited unused seats · ', amount: 312 },
    ],
    note: [
      { amount: 312 },
      " back, and next month's invoice drops to $1,440. The updated copy is on its way to your finance contact.",
    ],
    pause: 820,
  },
  { who: 'customer', text: "Incredible, that would've taken us an hour. Thank you!" },
]

/**
 * Radioso's own docs assistant, asked the self-referential question. The wow
 * beat is the opener: the agent knows it is the thing being asked about. No
 * action rows here — citations carry the grounding story, which also keeps the
 * three tabs from all looking alike.
 */
const DOCS_CHAT: Turn[] = [
  {
    who: 'radioso',
    think: 420,
    text: 'Hi, I answer from the Radioso docs. What can I help with?',
    pause: 640,
  },
  { who: 'customer', text: 'How do I put a Radioso agent on my website?' },
  {
    who: 'radioso',
    think: 800,
    text: "You're already talking to one. This chat is the website embed, running on radioso.ai. Installing yours is one tag:",
    code: '<script src="https://cdn.radioso.ai/embed.js"\n        data-token="wksp_your_token" async></script>',
    pause: 700,
  },
  {
    who: 'radioso',
    think: 520,
    text: "Grab the token from Channels → Website in the dashboard and paste the tag before </body>. That's it. The agent answers from whatever documents you've connected.",
    sources: ['website-embed'],
    pause: 760,
  },
  { who: 'customer', text: 'Can I make it match our brand?', pause: 520 },
  {
    who: 'radioso',
    think: 700,
    text: 'Yes. Colors, position, welcome message, and the suggested questions are all widget settings. Changes apply without redeploying. If you want full control, render your own UI on the REST API or the TypeScript SDK. Same agent, same grounding underneath.',
    sources: ['website-embed', 'sdk'],
    pause: 760,
  },
  { who: 'customer', text: 'And it only answers from our docs, right?', pause: 520 },
  {
    who: 'radioso',
    think: 700,
    text: 'From the documents you connect, yes. Every answer carries its citations. When your docs leave a question open, it says so. Directives let you tighten tone and rules from there.',
    sources: ['grounding', 'directives'],
  },
]

/**
 * The talk-to-the-team routine, played out. Qualification happens inside a
 * genuinely useful answer, the routine collects what it needs, and the team
 * gets the whole conversation. The same routine runs live behind the hero's
 * 💸 chip — the note under the scene points there.
 */
const LEADS_CHAT: Turn[] = [
  {
    who: 'radioso',
    think: 420,
    text: 'Hi, I can help you find the right setup. What kind of business are you running?',
    pause: 640,
  },
  {
    who: 'customer',
    text: 'I want to start using Radioso. We run an e-commerce store, about $4M a year selling espresso gear. Where do we start?',
  },
  {
    who: 'radioso',
    // The vertical-fluency beat gets the longest think of the scene.
    think: 900,
    text: "A store your size usually starts with two agents on one deployment. A support agent grounded in your policies handles orders, returns, and where-is-my-order. A product advisor on the storefront asks what they brew and recommends the right machine. What's your setup? Shopify or custom, and roughly how many tickets a month?",
    pause: 760,
  },
  { who: 'customer', text: 'Shopify, ~800 tickets a month, mostly shipping status and returns.', pause: 520 },
  {
    who: 'radioso',
    think: 800,
    text: "Then the support agent pays for itself first. Connect an order-lookup skill and shipping-status tickets resolve end to end. For returns, your rules decide what it refunds on its own and where a person signs off. Setting this up with your catalogue is worth a real conversation. What's the best email for the team to reach you?",
    pause: 760,
  },
  { who: 'customer', text: 'mia@espressolab.com', pause: 520 },
  {
    who: 'radioso',
    text: 'Done. You will hear from us today.',
    think: 620,
    actionGap: 720,
    actions: [
      { icon: Workflow, label: 'Started routine · talk-to-the-team' },
      { icon: UserSearch, label: 'Qualified · Shopify, ~800 tickets/mo' },
      { icon: Mail, label: 'Collected · mia@espressolab.com' },
      { icon: Headset, label: 'Handed to the team · full conversation attached' },
    ],
    note: ['The team starts with everything you just told me.'],
  },
]

export const SUPPORT_SCENE: SceneScript = { chat: SUPPORT_CHAT, plan: planChat(SUPPORT_CHAT) }
export const DOCS_SCENE: SceneScript = { chat: DOCS_CHAT, plan: planChat(DOCS_CHAT) }
export const LEADS_SCENE: SceneScript = { chat: LEADS_CHAT, plan: planChat(LEADS_CHAT) }
