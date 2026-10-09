import { getAllPosts } from '@/lib/blog'
import { FAQ_ITEMS } from '@/lib/faq'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants.
// Generated like the sitemap so the blog list never goes stale. Google does not
// read this file; the schema.org JSON-LD on each page is what search engines use.
export async function GET() {
  const posts = await getAllPosts()

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'Radioso is the customer service platform for AI agents, built for three audiences: customer-facing teams running support and pre-sales agents over their help center, developers embedding a service agent in their own product, and organizations that want one grounded knowledge base for customers and staff alike. Every product feature ships in the open-source release; the Enterprise Edition adds multi-tenant deployment at scale. Use Radioso Cloud with your own model keys, or self-host — the same agent across every channel: web, Slack, API, SDK, and MCP.',
    '',
    '## Pages',
    '',
    `- [Home](${site.url}/): what Radioso does, with a live agent grounded in the docs`,
    `- [Pricing](${site.url}/pricing.md): Radioso Cloud plans, conversation limits, top-ups, and self-hosting`,
    `- [Developers](${site.url}/developers): REST API, TypeScript SDK, website embed, MCP server, and local quickstart`,
    `- [Radioso for Slack](${site.url}/slack): ask grounded questions, run routines, and take action from Slack`,
    `- [Blog](${site.url}/blog)`,
    ...posts.map((post) => `  - [${post.title}](${site.url}/blog/${post.slug}): ${post.description}`),
    '',
    '## Elsewhere',
    '',
    `- [Documentation](${site.docsUrl}): setup, API reference, self-hosting`,
    `- [Radioso Cloud](${site.appUrl}): hosted version, sign in or create a workspace`,
    `- [GitHub](${site.githubUrl}): source code`,
    `- Contact: ${site.contactEmail}`,
    '',
    '## FAQ',
    '',
    ...FAQ_ITEMS.flatMap((item) => [`- ${item.question}`, `  ${item.answer}`]),
    '',
    '## Legal',
    '',
    `- [Privacy policy](${site.url}/legal/privacy-policy)`,
    `- [Terms of service](${site.url}/legal/terms-of-service)`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
