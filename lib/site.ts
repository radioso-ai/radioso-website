export const site = {
  name: 'Radioso',
  tagline: 'Self-hosted grounded agents that know your content — and act on it.',
  description:
    'Radioso is a self-hosted platform for grounded agents that act. Ground answers in your documents, steer behavior with directives, run multi-step routines, take action and hand off to a person — across web, API, SDK, and MCP, without a low-code canvas or a PhD in agent frameworks.',
  url: process.env.SITE_URL ?? 'https://radioso.ai',
  docsUrl: process.env.DOCS_SITE_URL ?? 'https://docs.radioso.ai',
  appUrl: process.env.APP_URL ?? 'https://app.radioso.ai',
  githubUrl: 'https://github.com/radioso-ai/',
  // Slack install entry point. Radioso's install flow is authenticated and
  // per-workspace — a workspace admin starts it from the dashboard's Slack
  // channel settings, which calls POST /workspaces/{id}/slack/install/start to
  // mint a per-request OAuth authorization URL (state + PKCE). There is no
  // static slack.com/oauth link to hardcode, so the public button sends people
  // into the app to run the install. Override with SLACK_INSTALL_URL if needed.
  slackInstallUrl: process.env.SLACK_INSTALL_URL ?? (process.env.APP_URL ?? 'https://app.radioso.ai'),
}
