'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, MessageCircle } from 'lucide-react'

import { AGENTS_SCENE, AgentsDiagramScene } from '@/components/agents-diagram'
import {
  MOTION_QUERY,
  ScriptedScene,
  SceneClockProvider,
  createSceneClock,
  sceneEnd,
  useIsomorphicLayoutEffect,
} from '@/components/scene-engine'
import { SUPPORT_SCENE, DOCS_SCENE, LEADS_SCENE } from '@/components/scenes'
import { Button } from '@/components/ui/button'
import { track as trackEvent } from '@/lib/analytics'
import { TALK_TO_THE_TEAM, useAsk } from '@/lib/ask-context'
import { EMBED_SNIPPET, site } from '@/lib/site'
import type { SceneScript } from '@/components/scene-engine'

/** Where the visitor goes once the job is shown. Buttons name the action. */
type Exit =
  | { kind: 'link'; label: string; href: string }
  /** The same question the launcher's chip asks, sent to the live agent in the chat launcher. */
  | { kind: 'ask'; label: string; question: string }
  | { kind: 'snippet'; label: string; code: string }

/* No rail copy: the scene beside the tabs is the explanation. A tab is the job,
   the setting the scene plays in, and the way out. */
type Tab = {
  id: string
  /** A job the agent does, not a kind of agent. */
  label: string
  scene: SceneScript
  sceneLabel: string
  exit: Exit
}

const TABS: Tab[] = [
  {
    id: 'support',
    label: 'Resolve tickets',
    scene: SUPPORT_SCENE,
    sceneLabel: 'A support ticket',
    exit: { kind: 'link', label: 'Start in the cloud', href: site.appUrl },
  },
  {
    id: 'docs',
    label: 'Answer from your help center',
    scene: DOCS_SCENE,
    sceneLabel: 'On your docs site',
    exit: { kind: 'snippet', label: 'Add it to your site', code: EMBED_SNIPPET },
  },
  {
    id: 'leads',
    label: 'Qualify leads',
    scene: LEADS_SCENE,
    sceneLabel: 'On your marketing site',
    exit: { kind: 'ask', label: 'Talk to the team', question: TALK_TO_THE_TEAM },
  },
  {
    id: 'agents',
    label: 'Serve your customers’ agents',
    scene: AGENTS_SCENE,
    sceneLabel: 'Over MCP',
    exit: { kind: 'link', label: 'Read the publishing guide', href: `${site.docsUrl}/guides/publish-an-agent` },
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

  const trackRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // One clock for the life of the section, handed to the scene through context.
  const clock = useMemo(() => createSceneClock(), [])

  const tab = useMemo(() => TABS.find((t) => t.id === active) ?? TABS[0], [active])
  const end = useMemo(() => ending(tab.scene), [tab])

  // The scroll loop reads the live scene through refs, so switching tabs never
  // tears the listener down and the visitor keeps their place in the track.
  const sceneRef = useRef({ id: tab.id, end, start: opening(tab.scene) })
  // Scenes that have played through once. A finished conversation stays finished:
  // scrolling back up over the section must not un-say what the agent said.
  const doneRef = useRef(new Set<string>())
  const applyRef = useRef<() => void>(() => {})

  useIsomorphicLayoutEffect(() => {
    sceneRef.current = { id: tab.id, end, start: opening(tab.scene) }
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
    //
    // The top padding is `--demo-lead`: the hero's navy backdrop runs on through
    // it and `--demo-straddle` further, so the card's top sits on the band.
    <section
      id="people"
      className="relative w-full scroll-mt-24 pb-24 pt-[var(--demo-lead)] [overflow-anchor:none] sm:pb-28"
    >
      {/* The track is the scroll distance; the stage is what the visitor watches
          while they cover it. Unarmed, the track is just a section and the stage
          just its contents. */}
      <div ref={trackRef} className="scene-track relative w-full">
        {/* Native anchor targets for the hero's deep links, 96px above the track
            so the browser lands with the stage already pinned at the top of its
            run, even before (or without) JS. The hashchange listener above picks
            the tab. */}
        {TABS.map((t) => (
          <span key={t.id} id={`demo-${t.id}`} className="absolute -top-24" aria-hidden />
        ))}

        <div
          ref={stageRef}
          className="scene-stage mx-auto w-full max-w-6xl px-4 data-[scrub=on]:sticky data-[scrub=on]:top-24 sm:px-6 xl:max-w-7xl"
        >
          {/* One card, two columns from `lg`: the tabs and the tab's exit on a
              muted ground at the left, the scene filling the right. Opaque,
              because its top half sits on the navy band.

              The tabpanel holds both the exit and the scene, which live in
              different columns, so from `lg` it spans the card as a subgrid and
              places its two children itself: the exit under the tab list, the
              scene down the full right column. The tab list sits above it in
              z-order so the panel's box never takes its clicks. */}
          <div className="demo-card mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:grid-rows-[auto_minmax(0,1fr)]">
            <div className="relative z-10 border-b border-border/70 bg-muted/40 px-4 py-3 sm:px-6 lg:col-start-1 lg:row-start-1 lg:border-b-0 lg:border-r lg:px-5 lg:pb-0 lg:pt-5">
              <p className="hidden text-xs font-medium text-muted-foreground lg:block">See it work</p>
              <div
                role="tablist"
                aria-label="Agent demos"
                className="flex flex-wrap justify-center gap-1 lg:mt-3 lg:flex-col lg:flex-nowrap lg:justify-start"
              >
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    id={`demo-tab-${t.id}`}
                    aria-selected={t.id === active}
                    aria-controls="demo-panel"
                    onClick={() => {
                      trackEvent('demo_tab_select', { tab: t.id })
                      setActive(t.id)
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm lg:rounded-lg lg:px-3 lg:py-2 lg:text-left ${
                      t.id === active
                        ? 'border-human/35 bg-human/10 text-foreground lg:font-semibold'
                        : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              id="demo-panel"
              role="tabpanel"
              aria-labelledby={`demo-tab-${tab.id}`}
              className="flex min-w-0 flex-col lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:grid lg:grid-cols-subgrid lg:grid-rows-subgrid"
            >
              {/* The way out of the story, at the foot of the left column with the
                  gap above it left empty. On a phone it waits under the section
                  (below), where it lands as the stage lets go. */}
              <div className="hidden min-h-0 flex-col items-start justify-end overflow-hidden bg-muted/40 px-5 pb-5 pt-5 lg:col-start-1 lg:row-start-2 lg:flex lg:border-r lg:border-border/70">
                <RailExit exit={tab.exit} />
              </div>

              <div className="flex min-h-0 min-w-0 flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1">
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
  if (exit.kind === 'ask') return <AskExit label={exit.label} question={exit.question} />
  return (
    <Button asChild variant="outline">
      <Link href={exit.href}>
        {exit.label} <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}

/** Sends the launcher chip's question to the live agent; asking opens the launcher. */
function AskExit({ label, question }: { label: string; question: string }) {
  const { ask, pending, openLauncher } = useAsk()

  const onClick = () => {
    // Mid-answer the agent won't take another question, so just open the chat.
    if (pending) {
      openLauncher('ask')
      return
    }
    void ask(question)
  }

  return (
    <Button variant="outline" onClick={onClick}>
      {label} <MessageCircle className="size-4" />
    </Button>
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
