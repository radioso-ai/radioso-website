export const site = {
  name: 'Radioso',
  tagline: 'Your voice in the conversation.',
  description:
    'Radioso is a self-hosted platform for building all your conversational agents in one place — support, sales, docs, internal help. Each one grounded in your documents with citations, steered by your rules, running multi-step routines, taking real action, and handing off to a person when it should — across web, API, SDK, and MCP.',
  url: process.env.SITE_URL ?? 'https://radioso.ai',
  docsUrl: process.env.DOCS_SITE_URL ?? 'https://docs.radioso.ai',
  appUrl: process.env.APP_URL ?? 'https://app.radioso.ai',
  githubUrl: 'https://github.com/radioso-ai/',
  contactEmail: 'hello@radioso.ai',
  // Slack install entry point. Radioso's install flow is authenticated and
  // per-workspace — a workspace admin starts it from the dashboard's Slack
  // channel settings, which calls POST /workspaces/{id}/slack/install/start to
  // mint a per-request OAuth authorization URL (state + PKCE). There is no
  // static slack.com/oauth link to hardcode, so the public button sends people
  // into the app to run the install. Override with SLACK_INSTALL_URL if needed.
  slackInstallUrl: process.env.SLACK_INSTALL_URL ?? (process.env.APP_URL ?? 'https://app.radioso.ai'),
}
