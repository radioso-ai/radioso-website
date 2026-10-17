import {
  BedDouble,
  CalendarCheck,
  CalendarDays,
  FileText,
  UserCheck,
  Workflow,
  UserSearch,
  Mail,
  Headset,
} from 'lucide-react'

import { planChat, type ChatScript, type Turn } from '@/components/scene-engine'
import { EMBED_SNIPPET } from '@/lib/site'

/* The three demo transcripts. Voice rules for every line of dialogue: no em
   dashes, no semicolons, no value-by-negation, no cutesy slang. The booking
   scene follows a real customer's flow; the docs and leads scenes are
   Radioso answering about itself, written as the target the live agent's
   knowledge base is being amended toward. */

/**
 * One booking, start to finish: a visitor asks whether a course still has room
 * and leaves with a confirmed stay. The agent checks the calendar, rooms and
 * rates, takes the booking, and hands it to reception, who confirm every stay
 * before it is final. A real customer's flow (a retreat center taking course
 * bookings), with the names and details changed.
 */
const BOOKING_CHAT: Turn[] = [
  {
    who: 'radioso',
    think: 420,
    text: 'Hi, I can help you find a course and book your stay. What are you looking for?',
    pause: 640,
  },
  {
    who: 'customer',
    text: 'Is there still a place on the five-day mindfulness course in November?',
  },
  {
    who: 'radioso',
    text: 'Let me check the calendar.',
    think: 620,
    // The lookups are quick, overlapping housekeeping — they should feel brisk.
    actionGap: 280,
    actions: [
      { icon: CalendarDays, label: 'Checked course calendar · Mindfulness, Nov 11–15' },
      { icon: BedDouble, label: 'Checked rooms · 3 singles, 6 doubles free' },
      { icon: FileText, label: 'Checked room rates · prices.md' },
    ],
    pause: 520,
  },
  {
    who: 'radioso',
    // The answer that does the work gets the longest think of the scene.
    think: 800,
    text: 'Yes, there are places for November 11 to 15. A single room with its own bathroom is $80 a day and a double is $60, all meals included. The course fee is separate. Which room would you like, and what name and email should I book it under?',
    pause: 760,
  },
  { who: 'customer', text: 'A single please. Anna Lee, anna@annalee.co', pause: 520 },
  {
    who: 'radioso',
    text: 'Booking it now. Reception confirms every stay, so one moment.',
    think: 620,
    // The heart of the scene: the booking, reception's sign-off, the confirmation.
    actionGap: 720,
    actions: [
      { icon: CalendarCheck, label: 'Held a place · single room, Nov 11–15' },
      { icon: Headset, label: 'Sent to reception · booking details attached' },
      { icon: UserCheck, label: 'Reception confirmed · Anna Lee' },
      { icon: Mail, label: 'Sent confirmation · anna@annalee.co' },
    ],
    note: ["You're booked for November 11 to 15 in a single room. The confirmation is in your inbox."],
    pause: 820,
  },
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
    code: EMBED_SNIPPET,
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
 * gets the whole conversation. The same routine runs live behind the chat
 * launcher's 💸 chip, and the tab's "Talk to the team" exit asks it for real.
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

export const BOOKING_SCENE: ChatScript = { kind: 'chat', chat: BOOKING_CHAT, plan: planChat(BOOKING_CHAT) }
export const DOCS_SCENE: ChatScript = { kind: 'chat', chat: DOCS_CHAT, plan: planChat(DOCS_CHAT) }
export const LEADS_SCENE: ChatScript = { kind: 'chat', chat: LEADS_CHAT, plan: planChat(LEADS_CHAT) }
