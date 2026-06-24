import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageSquare, FileSearch, Workflow, ShieldCheck } from 'lucide-react'

import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Radioso for Slack',
  description:
    'Add the Radioso app to your Slack workspace to ask grounded questions of your documents, run agent routines, and take action — without leaving Slack.',
  alternates: { canonical: `${site.url}/slack` },
}

const features = [
  {
    icon: MessageSquare,
    title: 'Ask in any channel',
    note: 'Mention @Radioso or DM the app to get grounded answers right where work happens.',
  },
  {
    icon: FileSearch,
    title: 'Grounded in your content',
    note: 'Answers cite your uploaded documents and knowledge — not a generic model guess.',
  },
  {
    icon: Workflow,
    title: 'Agents that act',
    note: 'Trigger multi-step routines and hand off to a teammate when a human is needed.',
  },
  {
    icon: ShieldCheck,
    title: 'Self-hosted & private',
    note: 'Runs on your own Radioso instance. Your data and LLM keys stay with you.',
  },
]

const steps = [
  {
    title: 'Sign in to Radioso',
    body: 'Click “Add to Slack” to open your Radioso workspace. Slack installs are started by a workspace admin from inside the app.',
  },
  {
    title: 'Open Slack channel settings',
    body: 'In your agent’s settings, find the Slack channel card and choose “Add to Slack” to begin the OAuth install.',
  },
  {
    title: 'Authorize in Slack',
    body: 'Radioso redirects you to Slack to pick a workspace and approve the requested permissions. Your Slack admin may need to grant approval.',
  },
  {
    title: 'Start asking',
    body: 'Back in Radioso, pick the answering agent for Slack. Then mention @Radioso in a channel or DM the app to get grounded answers and run routines.',
  },
]

function AddToSlackButton() {
  return (
    <a
      href={site.slackInstallUrl}
      aria-label="Add Radioso to Slack"
      className="inline-flex items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {/* Official Slack "Add to Slack" button asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Add to Slack"
        height={40}
        width={139}
        src="https://platform.slack-edge.com/img/add_to_slack.png"
        srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
      />
    </a>
  )
}

export default function SlackLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="inline-flex items-center" aria-label={site.name}>
            <Logo imageClassName="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Radioso for Slack</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Grounded answers and agents that act — inside Slack.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The Radioso Slack app brings your self-hosted grounded agents into your workspace. Ask
            questions of your documents, run multi-step routines, and hand off to a teammate — without
            leaving the conversation.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <AddToSlackButton />
            <Button asChild variant="outline">
              <Link href={site.docsUrl}>
                Read the docs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/50">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-x-10 gap-y-8 px-6 py-12 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, note }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
                  <p className="text-[13px] leading-snug text-muted-foreground">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How to install
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to add Radioso to Slack?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Installs in a couple of clicks. You can remove it anytime from your Slack workspace
                settings.
              </p>
            </div>
            <AddToSlackButton />
          </div>

          <p className="mt-8 text-sm leading-7 text-muted-foreground">
            Need help? Read the{' '}
            <Link href={site.docsUrl} className="font-medium text-foreground underline underline-offset-4">
              documentation
            </Link>
            , review our{' '}
            <Link
              href="/legal/privacy-policy"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link
              href="/legal/terms-of-service"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Terms of Service
            </Link>
            , or browse the project on{' '}
            <Link href={site.githubUrl} className="font-medium text-foreground underline underline-offset-4">
              GitHub
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
