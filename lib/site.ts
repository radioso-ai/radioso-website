export const site = {
  name: 'Radioso',
  tagline: 'Self-hosted grounded agents that know your content — and act on it.',
  description:
    'Radioso is a self-hosted context platform for grounded assistants. Ingest your documents, ground answers in your knowledge, and ship a working assistant across web, API, SDK, and MCP — without a low-code canvas or a PhD in agent frameworks.',
  url: process.env.SITE_URL ?? 'https://radioso.dev',
  docsUrl: process.env.DOCS_SITE_URL ?? 'https://docs.radioso.dev',
  appUrl: process.env.APP_URL ?? 'https://app.radioso.dev',
  githubUrl: 'https://github.com/radioso/radioso',
}
