'use client'

import { useEffect, useState } from 'react'
import { Wrench, Code2, MessageCircle, Quote, Store, UserSearch } from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { ScriptedScene } from '@/components/scene-engine'
import { SUPPORT_SCENE, DOCS_SCENE, LEADS_SCENE } from '@/components/scenes'
import { PixelSprite, SignalMark, AVATAR_CUSTOMER, AVATAR_TEAMMATE } from '@/components/pixel-sprite'
import type { SceneScript } from '@/components/scene-engine'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

type Step = {
  /** Blue icon tile = the machine acting; a pixel avatar in the yellow tile = a person in the loop. */
  marker: { icon: Icon } | { avatar: typeof AVATAR_CUSTOMER; title: string }
  title: string
  body: string
}

type Tab = {
  id: string
  label: string
  railTitle: string
  railIntro: string
  /* Every step is a beat the transcript beside it actually shows — the rail is
     a summary of the scene, and must never claim a beat the scene doesn't. */
  steps: Step[]
  scene: SceneScript
  sceneLabel: string
  note: ReactNode
}

const TABS: Tab[] = [
  {
    id: 'support',
    label: 'Support agent',
    railTitle: 'It knows when to act — and when to ask.',
    railIntro: 'One billing ticket, start to finish.',
    steps: [
      {
        marker: { icon: Wrench },
        title: 'Does the work',
        body: 'Pulls the account, checks who is actually active, reads your billing policy — every action listed as it takes it.',
      },
      {
        marker: { avatar: AVATAR_CUSTOMER, title: 'The customer' },
        title: 'Asks the customer',
        body: 'The fix changes billing, so nothing happens without Maria\u2019s yes.',
      },
      {
        marker: { avatar: AVATAR_TEAMMATE, title: 'A teammate' },
        title: 'Hands off for sign-off',
        body: 'The credit is above its limit. Jonas gets the full conversation, approves, and the agent finishes the job.',
      },
    ],
    scene: SUPPORT_SCENE,
    sceneLabel: 'a support ticket',
    note: null,
  },
  {
    id: 'docs',
    label: 'Docs assistant',
    railTitle: 'Your docs, answering for themselves.',
    railIntro: 'Asked about Radioso, answered from the Radioso docs.',
    steps: [
      {
        marker: { icon: Code2 },
        title: 'Answers with the install itself',
        body: 'The copy-paste tag, in the first reply — cited to the doc it came from.',
      },
      {
        marker: { icon: MessageCircle },
        title: 'Knows where it is standing',
        body: 'It is the embed it is explaining, and it says so.',
      },
      {
        marker: { icon: Quote },
        title: 'Grounded by construction',
        body: 'Citations on every claim. When the docs leave a question open, it says so out loud.',
      },
    ],
    scene: DOCS_SCENE,
    sceneLabel: 'on your docs site',
    note: null,
  },
  {
    id: 'leads',
    label: 'Lead qualifier',
    railTitle: 'From visitor to warm lead.',
    railIntro: 'A routine qualifies, collects, and hands off.',
    steps: [
      {
        marker: { icon: Store },
        title: 'Sells with real answers',
        body: 'Vertical advice before any ask — which agents fit the store, and what to stand up first.',
      },
      {
        marker: { icon: UserSearch },
        title: 'Qualifies in conversation',
        body: 'The questions come up while it helps — platform, volume, timing.',
      },
      {
        marker: { avatar: AVATAR_TEAMMATE, title: 'A teammate' },
        title: 'Hands the team a warm lead',
        body: 'Email collected, context attached, follow-up the same day.',
      },
    ],
    scene: LEADS_SCENE,
    sceneLabel: 'on your marketing site',
    note: (
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
        This routine runs live on this page — the 💸 chip in the hero triggers it for real.
      </p>
    ),
  },
]

/** `#demo-<id>` hashes deep-link a tab — the hero subhead links point here. */
const HASH_PREFIX = '#demo-'

export function AgentDemos() {
  const [active, setActive] = useState(TABS[0].id)

  useEffect(() => {
    const apply = () => {
      const id = window.location.hash.startsWith(HASH_PREFIX)
        ? window.location.hash.slice(HASH_PREFIX.length)
        : null
      if (id && TABS.some((t) => t.id === id)) setActive(id)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    // A tab switch replaces one tall scene subtree with another. Opting the
    // section out of scroll anchoring means the browser can never "correct"
    // the viewport off the tab bar mid-swap, whatever the height delta.
    <section
      id="people"
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24 [overflow-anchor:none] sm:py-28 xl:max-w-7xl"
    >
      {/* Native anchor targets for the hero's deep links: the browser scrolls
          here even before (or without) JS, and the hashchange listener above
          picks the tab. */}
      {TABS.map((t) => (
        <span key={t.id} id={`demo-${t.id}`} className="absolute -top-24" aria-hidden />
      ))}

      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SignalMark color="var(--human)" />
        </div>
        <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Different agents, one platform.
        </h2>

        <div
          role="tablist"
          aria-label="Agent demos"
          className="mx-auto mt-8 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/70 bg-card/90 p-1.5"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`demo-tab-${t.id}`}
              aria-selected={t.id === active}
              aria-controls="demo-panel"
              onClick={() => setActive(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                t.id === active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div
          id="demo-panel"
          role="tabpanel"
          aria-labelledby={`demo-tab-${tab.id}`}
          className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
        >
        <div className="mx-auto max-w-2xl text-center lg:sticky lg:top-28 lg:mx-0 lg:text-left">
          <h3 className="display-serif font-serif text-2xl font-bold tracking-tight">
            {tab.railTitle}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{tab.railIntro}</p>

          <ol className="mx-auto mt-8 max-w-md space-y-5 text-left lg:mx-0 lg:max-w-none">
            {tab.steps.map((step) => (
              <li key={step.title} className="flex items-start gap-3">
                {'icon' in step.marker ? (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.marker.icon className="size-4" />
                  </div>
                ) : (
                  <div className="flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-human/35 bg-human/10">
                    <PixelSprite
                      grid={step.marker.avatar.grid}
                      palette={step.marker.avatar.palette}
                      className="size-8"
                      title={step.marker.title}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight">{step.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-foreground/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0">
          {/* Keyed by tab: a fresh mount re-arms the grow chrome and replays the
              scene from the top, exactly like the first scroll into view. */}
          <ScriptedScene key={tab.id} script={tab.scene} label={tab.sceneLabel} />
          {tab.note}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
