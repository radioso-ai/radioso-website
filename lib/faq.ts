export type FaqItem = { question: string; answer: string }

// Keep the homepage questions buyer-facing. Provider, integration, architecture,
// and deployment detail belongs on /developers and in the docs. Lives outside the
// client component so the homepage FAQPage JSON-LD can read the same list.
//
// Every question here is also sent to the live agent by its "Ask the agent" button, so
// ask about "a Radioso agent" or name what the visitor would do, never "it" or a bare
// "Radioso" as the actor. The agent is named "Radioso Assistant" and reads both as
// questions about itself: "Can Radioso take actions, or is it just a chatbot?" got "I
// can't take actions on your behalf" twice. The self-host and actions questions below
// answered from the docs in two of two live runs on 2026-11-20. See the same rule on the
// chat launcher's chips.
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is Radioso really open source, or is there a paid tier?',
    answer:
      'Every product feature ships in the open release. The Enterprise Edition covers multi-tenant deployments at scale.',
  },
  {
    question: 'Can I self-host Radioso?',
    answer:
      'Yes, run the whole platform on your own infrastructure, or use Radioso Cloud with the same product, on your own model keys or ours.',
  },
  {
    question: 'Can a Radioso agent take actions, or is it just a chatbot?',
    answer:
      'It calls tools, fires webhooks, and runs multi-step routines, then hands off to a person with full context when it should.',
  },
]
