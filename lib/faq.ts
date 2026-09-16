export type FaqItem = { question: string; answer: string }

// Keep the homepage questions buyer-facing. Provider, integration, architecture,
// and deployment detail belongs on /developers and in the docs. Lives outside the
// client component so the homepage FAQPage JSON-LD can read the same list.
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is Radioso really open source, or is there a paid tier?',
    answer:
      'Every product feature ships in the open release. The Enterprise Edition covers multi-tenant deployments at scale.',
  },
  {
    question: 'Can I self-host it?',
    answer:
      'Yes — run the whole platform on your own infrastructure, or use Radioso Cloud with the same product and your own model keys.',
  },
  {
    question: 'Can it take actions, or is it just a chatbot?',
    answer:
      'It calls tools, fires webhooks, and runs multi-step routines — then hands off to a person with full context when it should.',
  },
]
