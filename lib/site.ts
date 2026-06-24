export const site = {
  name: 'Radioso',
  tagline: 'Self-hosted grounded agents that know your content — and act on it.',
  description:
    'Radioso is a self-hosted platform for grounded agents that act. Ground answers in your documents, steer behavior with directives, run multi-step routines, take action and hand off to a person — across web, API, SDK, and MCP, without a low-code canvas or a PhD in agent frameworks.',
  url: process.env.SITE_URL ?? 'https://radioso.ai',
  docsUrl: process.env.DOCS_SITE_URL ?? 'https://docs.radioso.ai',
  appUrl: process.env.APP_URL ?? 'https://app.radioso.ai',
  githubUrl: 'https://github.com/radioso-ai/',
  // Slack OAuth "Add to Slack" install URL. Override per-deployment with the
  // real slack.com/oauth/v2/authorize link (with client_id + scopes).
  slackInstallUrl:
    process.env.SLACK_INSTALL_URL ??
    'https://slack.com/oauth/v2/authorize?response_type=code&client_id=10597316262275.11396342451911&redirect_uri=https%3A%2F%2Fapi.radioso.ai%2Fapi%2Fv1%2Foauth%2Fcallback%2Fslack&state=eyJ2IjoxLCJwcm92aWRlciI6InNsYWNrIiwid29ya3NwYWNlSWQiOiI0NThmNDk1Ni1lYmEyLTQ3ZmItYmI5MS1mNjQ5ZDMxZmZjZWUiLCJjb25uZWN0aW9uSWQiOiI4ZTNmZDA0Zi1jYjg1LTQzOTItODFiMy0xYzUwNWRhNTg2MzAiLCJub25jZSI6IkhUbWJ4OTZWVU9vUVRDZGZsY1FUSXcifQ.NgiVMnEhidFnONVTqMLLt2pj1g6Bj3xmZN18IRbz4eI&code_challenge=JQs0IrQHPtth9jRJUXYbPjnynVv-b7gzCxv4DjSvBr4&code_challenge_method=S256&scope=app_mentions%3Aread+chat%3Awrite+im%3Ahistory+im%3Aread+im%3Awrite',
}
