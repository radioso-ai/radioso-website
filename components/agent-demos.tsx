'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUp,
  Check,
  Code2,
  Copy,
  Quote,
  MessageCircle,
  Plug,
  Repeat,
  ShieldCheck,
  Store,
  UserSearch,
  Wrench,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import { AGENTS_BEATS, AGENTS_SCENE, AgentsDiagramScene } from '@/components/agents-diagram'
import {
  MOTION_QUERY,
  ScriptedScene,
  SceneClockProvider,
  createSceneClock,
  sceneEnd,
  useIsomorphicLayoutEffect,
} from '@/components/scene-engine'
import { SUPPORT_SCENE, DOCS_SCENE, LEADS_SCENE } from '@/components/scenes'
import { PixelSprite, SignalMark, AVATAR_CUSTOMER, AVATAR_TEAMMATE } from '@/components/pixel-sprite'
import { Button } from '@/components/ui/button'
import { TALK_TO_THE_TEAM, useAsk } from '@/lib/ask-context'
import { EMBED_SNIPPET, site } from '@/lib/site'
import type { SceneScript } from '@/components/scene-engine'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

type Step = {
  /** Blue icon tile = the machine acting; a pixel avatar in the yellow tile = a person in the loop. */
  marker: { icon: Icon } | { avatar: typeof AVATAR_CUSTOMER; title: string }
  title: string
  body: string
  /** The point on the scene's timeline this step describes, so the rail can follow along. */
  at: number
}

/** Where the visitor goes once the job is shown. Buttons name the action. */
type Exit =
  | { kind: 'link'; label: string; href: string }
  /** The same question the hero chip asks, sent to the live agent at the top of the page. */
  | { kind: 'ask'; label: string; question: string; hint: string }
  | { kind: 'snippet'; label: string; code: string }

type Tab = {
  id: string
  /** A job the agent does, not a kind of agent. */
  label: string
  railTitle: string
  railIntro: string
  /* Every step is a beat the transcript beside it actually shows — the rail is
     a summary of the scene, and must never claim a beat the scene doesn't. Its
     `at` points at the turn it summarises, taken from that scene's own plan. */
  steps: Step[]
  scene: SceneScript
  sceneLabel: string
  exit: Exit
}

const TABS: Tab[] = [
  {
    id: 'support',
    label: 'Resolve tickets',
    railTitle: 'Knows when to act, and when to ask.',
    railIntro: 'One billing ticket, start to finish.',
    steps: [
      {
        marker: { icon: Wrench },
        title: 'Does the work',
        body: 'Pulls the account, checks who is actually active, reads your billing policy — every action listed as it takes it.',
        at: SUPPORT_SCENE.plan[2].textAt,
      },
      {
        marker: { avatar: AVATAR_CUSTOMER, title: 'The customer' },
        title: 'Asks the customer',
        body: 'The fix changes billing, so nothing happens without Maria’s yes.',
        at: SUPPORT_SCENE.plan[3].textAt,
      },
      {
        marker: { avatar: AVATAR_TEAMMATE, title: 'A teammate' },
        title: 'Hands off for sign-off',
        body: 'The credit is above its limit. Jonas gets the full conversation, approves, and the agent finishes the job.',
        at: SUPPORT_SCENE.plan[5].textAt,
      },
    ],
    scene: SUPPORT_SCENE,
    sceneLabel: 'a support ticket',
    exit: { kind: 'link', label: 'Start in the cloud', href: site.appUrl },
  },
  {
    id: 'docs',
    label: 'Answer from your help center',
    railTitle: 'Your docs, answering for themselves.',
    railIntro: 'Asked about Radioso, answered from the Radioso docs.',
    steps: [
      {
        marker: { icon: Code2 },
        title: 'Answers with the install itself',
        body: 'The copy-paste tag, in the first reply — cited to the doc it came from.',
        at: DOCS_SCENE.plan[2].textAt,
      },
      {
        marker: { icon: MessageCircle },
        title: 'Knows where it is standing',
        body: 'It is the embed it is explaining, and it says so.',
        at: DOCS_SCENE.plan[3].textAt,
      },
      {
        marker: { icon: Quote },
        title: 'Grounded by construction',
        body: 'Citations on every claim. When the docs leave a question open, it says so out loud.',
        at: DOCS_SCENE.plan[7].textAt,
      },
    ],
    scene: DOCS_SCENE,
    sceneLabel: 'on your docs site',
    exit: { kind: 'snippet', label: 'Add it to your site', code: EMBED_SNIPPET },
  },
  {
    id: 'leads',
    label: 'Qualify leads',
    railTitle: 'From visitor to warm lead.',
    railIntro: 'A routine qualifies, collects, and hands off.',
    steps: [
      {
        marker: { icon: Store },
        title: 'Sells with real answers',
        body: 'Vertical advice before any ask — which agents fit the store, and what to stand up first.',
        at: LEADS_SCENE.plan[2].textAt,
      },
      {
        marker: { icon: UserSearch },
        title: 'Qualifies in conversation',
        body: 'The questions come up while it helps — platform, volume, timing.',
        at: LEADS_SCENE.plan[4].textAt,
      },
      {
        marker: { avatar: AVATAR_TEAMMATE, title: 'A teammate' },
        title: 'Hands the team a warm lead',
        body: 'Email collected, context attached, follow-up the same day.',
        at: LEADS_SCENE.plan[6].textAt,
      },
    ],
    scene: LEADS_SCENE,
    sceneLabel: 'on your marketing site',
    exit: {
      kind: 'ask',
      label: 'Talk to the team',
      question: TALK_TO_THE_TEAM,
      hint: 'Runs this routine live in the chat at the top of the page.',
    },
  },
  {
    id: 'agents',
    label: 'Serve your customers’ agents',
    railTitle: 'When the customer sends an agent.',
    railIntro: 'Your customer’s AI assistant asks about your product, and Radioso answers it over MCP.',
    steps: [
      {
        marker: { icon: Plug },
        title: 'Connect once',
        body: 'One MCP server for Claude, ChatGPT, Cursor, and any other MCP client, each with its own credential.',
        at: AGENTS_BEATS.sources[0],
      },
      {
        marker: { icon: Repeat },
        title: 'Same answer everywhere',
        body: 'The knowledge, rules, and citations behind your chat and your help center answer every assistant.',
        at: AGENTS_BEATS.answer,
      },
      {
        marker: { icon: ShieldCheck },
        title: 'Your terms',
        body: 'Your rules decide what an agent is told, and what it is not.',
        at: AGENTS_BEATS.rules,
      },
    ],
    scene: AGENTS_SCENE,
    sceneLabel: 'over MCP',
    exit: { kind: 'link', label: 'Read the MCP docs', href: `${site.docsUrl}/guides/mcp-server` },
  },
]

/** `#demo-<id>` hashes deep-link a tab — the hero subhead links point here. */
const HASH_PREFIX = '#demo-'

/**
 * Where the pinned stage sits: clear of the pill nav, which is itself `top-4`
 * and about 60px tall. Matches the section's own `scroll-mt-24`.
 */
const STICKY_TOP = 96

/** Dead zones at either end of the track, as a share of its scroll distance: the
    card is fully pinned before the first line lands, and the finished scene holds
    for a moment before the section lets go. */
const HEAD = 0.08
const TAIL = 0.12

/** The scene never shows an empty card: the opening exchange (greeting and the
    customer's ask) is already on screen at the top of the track, so a hero
    deep-link or a slow approach lands on a conversation, not a blank window.
    Scroll scrubs from that point to the end. A diagram names its own first
    frame: its first beat, already landed. */
const opening = (scene: SceneScript) =>
  scene.kind === 'diagram'
    ? scene.start
    : (scene.plan[1] ?? scene.plan[0]).textAt + 440 // past its rise-in (--dur-base)

const ending = (scene: SceneScript) => (scene.kind === 'diagram' ? scene.end : sceneEnd(scene.plan))

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

export function AgentDemos() {
  const [active, setActive] = useState(TABS[0].id)
  const [step, setStep] = useState(0)

  const trackRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // One clock for the life of the section, handed to the scene through context.
  const clock = useMemo(() => createSceneClock(), [])

  const tab = useMemo(() => TABS.find((t) => t.id === active) ?? TABS[0], [active])
  const end = useMemo(() => ending(tab.scene), [tab])

  // The scroll loop reads the live scene through refs, so switching tabs never
  // tears the listener down and the visitor keeps their place in the track.
  const sceneRef = useRef({ id: tab.id, end, start: opening(tab.scene), steps: tab.steps.map((s) => s.at) })
  const stepRef = useRef(0)
  // Scenes that have played through once. A finished conversation stays finished:
  // scrolling back up over the section must not un-say what the agent said.
  const doneRef = useRef(new Set<string>())
  const applyRef = useRef<() => void>(() => {})

  useIsomorphicLayoutEffect(() => {
    sceneRef.current = { id: tab.id, end, start: opening(tab.scene), steps: tab.steps.map((s) => s.at) }
  }, [end, tab])

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

  // Arm the scrub before the first paint: the track grows its scroll distance,
  // the stage becomes sticky, and the scene winds back to its first frame. Under
  // reduced motion none of that happens and the finished transcript stands in
  // normal flow, exactly as it was served.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    if (window.matchMedia(MOTION_QUERY).matches) return

    clock.arm()
    track.dataset.scrub = 'on'
    stage.dataset.scrub = 'on'

    let frame = 0
    let queued = false

    const apply = () => {
      queued = false
      const top = track.getBoundingClientRect().top
      // How far the stage spends stuck: everything in the track that isn't the
      // stage itself. `top` reaches STICKY_TOP as the pin starts and keeps going.
      const distance = Math.max(1, track.offsetHeight - stage.offsetHeight)
      const p = clamp01((STICKY_TOP - top) / distance)
      const { id, end, start } = sceneRef.current
      let scene = clamp01((p - HEAD) / (1 - HEAD - TAIL))
      if (scene >= 1) doneRef.current.add(id)
      const done = doneRef.current.has(id)
      if (done) scene = 1
      const t = start + scene * (end - start)

      stage.style.setProperty('--scene-t', `${t.toFixed(1)}ms`)
      // A finished scene hands its card over: CSS turns the transcript into a
      // scroll container the visitor owns (see the scene block in globals.css).
      stage.dataset.scene = done ? 'done' : 'playing'
      clock.emit(t, done)

      const ats = sceneRef.current.steps
      let next = 0
      for (let i = 0; i < ats.length; i += 1) if (t >= ats[i]) next = i
      if (next !== stepRef.current) {
        stepRef.current = next
        setStep(next)
      }
    }
    applyRef.current = apply

    const onScroll = () => {
      if (queued) return
      queued = true
      frame = requestAnimationFrame(apply)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const observer = new ResizeObserver(onScroll)
    observer.observe(track)
    apply()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observer.disconnect()
      cancelAnimationFrame(frame)
      applyRef.current = () => {}
    }
  }, [clock])

  // A tab switch keeps the scroll position but changes the timeline under it:
  // re-apply the same progress to the new scene before it paints.
  useIsomorphicLayoutEffect(() => {
    applyRef.current()
  }, [active])

  return (
    // A tab switch replaces one tall scene subtree with another. Opting the
    // section out of scroll anchoring means the browser can never "correct"
    // the viewport off the tab bar mid-swap, whatever the height delta.
    <section
      id="people"
      className="relative w-full scroll-mt-24 py-24 [overflow-anchor:none] sm:py-28"
    >
      {/* Native anchor targets for the hero's deep links: the browser scrolls
          here even before (or without) JS, and the hashchange listener above
          picks the tab. */}
      {TABS.map((t) => (
        <span key={t.id} id={`demo-${t.id}`} className="absolute -top-24" aria-hidden />
      ))}

      {/* The track is the scroll distance; the stage is what the visitor watches
          while they cover it. Unarmed, the track is just a section and the stage
          just its contents. */}
      <div ref={trackRef} className="scene-track relative w-full">
        <div
          ref={stageRef}
          className="scene-stage mx-auto w-full max-w-6xl px-6 data-[scrub=on]:sticky data-[scrub=on]:top-24 xl:max-w-7xl"
        >
          <Reveal className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <SignalMark color="var(--human)" />
            </div>
            <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              What your agents handle.
            </h2>

            <div
              role="tablist"
              aria-label="Agent demos"
              // The radius is the pills' own plus the padding, so a bar that wraps
              // to two rows on a phone stays concentric with the pills inside it.
              className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-1 rounded-[1.375rem] border border-border/70 bg-card/90 p-1.5"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`demo-tab-${t.id}`}
                  aria-selected={t.id === active}
                  aria-controls="demo-panel"
                  onClick={() => setActive(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
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

          <div
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`demo-tab-${tab.id}`}
            className="mt-6 grid items-start gap-5 lg:mt-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14"
          >
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <h3 className="display-serif text-balance font-serif text-xl font-bold tracking-tight sm:text-2xl">
                {tab.railTitle}
              </h3>
              {/* The one-line setup is desktop-only: on a phone the rail is down
                  to a single step already and the card needs the room. */}
              <p className="hidden text-base leading-relaxed text-muted-foreground lg:mt-3 lg:block">
                {tab.railIntro}
              </p>

              {/* Below `lg` the rail collapses to whichever step the scene is on
                  — its title and its sentence — because the full three-step rail
                  plus the card does not fit a phone. */}
              <ol className="mx-auto mt-3 max-w-md space-y-5 text-left lg:mx-0 lg:mt-8 lg:max-w-none">
                {tab.steps.map((s, i) => (
                  <li
                    key={s.title}
                    data-state={i === step ? 'active' : i < step ? 'done' : 'upcoming'}
                    className="scene-rail-step flex items-start gap-3"
                  >
                    {'icon' in s.marker ? (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.marker.icon className="size-4" />
                      </div>
                    ) : (
                      <div className="flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-human/35 bg-human/10">
                        <PixelSprite
                          grid={s.marker.avatar.grid}
                          palette={s.marker.avatar.palette}
                          className="size-8"
                          title={s.marker.title}
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-lg font-semibold tracking-tight">{s.title}</p>
                      <p className="scene-rail-body mt-1 text-[15px] leading-relaxed text-foreground/70">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* The way out of the story. Beside the card on desktop; on a phone it
                  waits under the section (below), where it lands as the stage lets go. */}
              <div className="mt-8 hidden lg:block">
                <RailExit exit={tab.exit} />
              </div>
            </div>

            <div className="min-w-0">
              <SceneClockProvider value={clock}>
                {/* Keyed by tab: a fresh mount re-measures the new transcript and
                    picks up the scroll position the visitor is already at. */}
                {tab.scene.kind === 'diagram' ? (
                  <AgentsDiagramScene key={tab.id} label={tab.sceneLabel} />
                ) : (
                  <ScriptedScene key={tab.id} script={tab.scene} label={tab.sceneLabel} />
                )}
              </SceneClockProvider>
            </div>
          </div>
        </div>

        {/* The scroll distance itself. It has to be a child, not padding: a
            sticky element is held inside its parent's *content* box, so padding
            would give the stage nothing to stick through. */}
        <div aria-hidden className="scene-runway" />
      </div>

      {/* Below `lg` there is no room in the pinned stage for the exit, so it sits
          just past the track: it arrives directly under the card as the stage
          releases, once the scene has played. */}
      <div className="mx-auto mt-6 flex max-w-2xl justify-center px-6 lg:hidden">
        <RailExit exit={tab.exit} />
      </div>
    </section>
  )
}

function RailExit({ exit }: { exit: Exit }) {
  if (exit.kind === 'snippet') return <SnippetExit label={exit.label} code={exit.code} />
  if (exit.kind === 'ask') return <AskExit label={exit.label} question={exit.question} hint={exit.hint} />
  return (
    <Button asChild variant="outline">
      <Link href={exit.href}>
        {exit.label} <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}

/** Sends the hero chip's question to the live agent; the hero scrolls itself into view. */
function AskExit({ label, question, hint }: { label: string; question: string; hint: string }) {
  const { ask, pending } = useAsk()

  const onClick = () => {
    // Mid-answer the hero won't take another question, so just go to it.
    if (pending) {
      document.getElementById('ask-radioso')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    void ask(question)
  }

  return (
    <div className="flex flex-col items-center gap-2 lg:items-start">
      <Button variant="outline" onClick={onClick}>
        {label} <ArrowUp className="size-4" />
      </Button>
      <p className="text-center text-sm text-muted-foreground lg:text-left">{hint}</p>
    </div>
  )
}

/** The install tag, compact, with a copy button. */
function SnippetExit({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (insecure origin, denied permission): the code is selectable.
    }
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card text-left">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1 pl-3 pr-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="no-scrollbar overflow-x-auto px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground/85">
        {code}
      </pre>
    </div>
  )
}
