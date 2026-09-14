import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { PageShell } from '@/components/page-shell'
import { PricingPlans } from '@/components/pricing-plans'
import { SignalMark } from '@/components/pixel-sprite'
import { Reveal } from '@/components/reveal'
import { COUNTS_AS, MANAGED, MANAGED_ANSWER_MODEL, REPLIES_PER_CONVERSATION, TOP_UP } from '@/lib/pricing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Radioso pricing: free for 50 conversations a month, €149 for 1,000, €499 for 10,000 with your own model keys. No per-seat fees and no per-resolution billing, and every product feature stays open source if you self-host.',
  alternates: { canonical: `${site.url}/pricing` },
}

// Answers the questions a volume-priced plan raises before someone has to email
// to ask them. Kept as plain copy rather than an accordion — on a pricing page
// the objections should be readable at a glance, not behind a click.
const NOTES: { question: string; answer: ReactNode }[] = [
  {
    question: 'What counts as a conversation?',
    answer: (
      <>
        <p>
          One person talking to one agent, up to {REPLIES_PER_CONVERSATION} replies. Retrieval, tool
          calls, and the steps of a routine are not counted separately: a routine that takes six
          internal steps to answer someone is still one reply. A conversation that runs past{' '}
          {REPLIES_PER_CONVERSATION} replies counts again for every further {REPLIES_PER_CONVERSATION}.
        </p>
        <p className="mt-3">Your own work with the agent counts too, lightly:</p>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {COUNTS_AS.map((row) => (
              <tr key={row.what} className="border-t border-border/70">
                <td className="py-2 pr-4 text-muted-foreground">{row.what}</td>
                <td className="py-2 text-right font-mono tabular-nums text-foreground">{row.counts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3">
          Every line shows up in your usage view, so the month adds up in front of you.
        </p>
      </>
    ),
  },
  {
    question: 'Which model answers my customers?',
    answer: `Comet and Satellite run on ${MANAGED_ANSWER_MODEL}, with smaller models for the steps around it. There are no model multipliers and no credit tables: a conversation is a conversation. If you want a different model, Planet runs on your own keys with any model you choose, and we charge the same per conversation.`,
  },
  {
    question: 'What happens when I reach the limit?',
    answer: `The agent tells you before you get there, at 80 percent. At the limit you can move up a plan, or buy a top-up: ${TOP_UP.price} for ${TOP_UP.conversations} more conversations, one-off, and they never expire. Nothing is charged automatically and there is no overage bill at the end of the month.`,
  },
  {
    question: 'What counts toward content storage?',
    answer:
      'The text of the documents and pages you give the agent. A typical product page or help article is around 3 KB, so 10 MB is roughly 3,000 pages and 100 MB roughly 30,000. Embeddings and the index we build from your content do not count against you. At the limit, new uploads pause until you remove something or move up a plan; nothing already indexed is deleted.',
  },
  {
    question: 'Why do you not charge per seat?',
    answer:
      'Because seat pricing punishes you for letting your team use the thing. Invite your whole support desk, your engineers, and everyone who writes documentation. Headcount is not our business.',
  },
  {
    question: 'Why does Planet use my keys instead of yours?',
    answer:
      'At volume, teams already have negotiated model contracts, their own rate limits, and their own data-processing agreements with providers. Planet lets you keep all of that, and it is why Planet costs half as much per conversation as Satellite. It is a plan for using your own terms, not a plan with the models removed.',
  },
  {
    question: 'Is anything gated behind a paid plan?',
    answer:
      'No. Every product feature is on every plan, including the free one. The plans differ in how many conversations a month, who pays for the models, and how quickly we answer your email.',
  },
  {
    question: 'Can you run it for us?',
    answer: `Yes. ${MANAGED.scope} ${MANAGED.price} ${MANAGED.note}, including the free one. Most of the organisations we run agents for are small teams who would rather have it done than learn to do it, and the software stays yours either way.`,
  },
  {
    question: 'Can I move between the cloud and self-hosting?',
    answer:
      'Yes, in both directions. It is the same open source code either way. The cloud is us running the servers, not a different product, and there is no proprietary tier to get stranded on.',
  },
]

export default function PricingPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <SignalMark color="var(--primary)" />
          </div>
          <h1 className="display-serif font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            No per-seat. No per-resolution.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Most agent platforms bill for every conversation they resolve, so the better the agent
            works, the more you owe. Radioso prices on conversations, in plans you can read in
            one line.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every feature is on every plan. The plans differ in volume, and in who pays for the models.
          </p>
        </div>

        <div className="mt-14">
          <PricingPlans />
        </div>

        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="display-serif text-center font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            The details worth knowing.
          </h2>
          <dl className="mt-12 space-y-8">
            {NOTES.map((note, i) => (
              <Reveal key={note.question} delay={i * 90} className="border-t border-border/70 pt-6">
                <dt className="display-serif font-serif text-base font-semibold text-foreground sm:text-lg">
                  {note.question}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {note.answer}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Something here not quite fitting your shape?{' '}
            <a
              href={`mailto:${site.contactEmail}`}
              className="font-medium text-primary hover:underline"
            >
              Tell us what you need
            </a>{' '}
            and we will work it out together.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
