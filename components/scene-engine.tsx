'use client'

import Image from 'next/image'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import { Check } from 'lucide-react'
import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react'

import { PixelSprite, SignalMark, AVATAR_CUSTOMER } from '@/components/pixel-sprite'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** A number that counts up when the scene plays. Renders its final value on the server. */
export type Amount = { amount: number }
export type Piece = string | Amount

export type Action = { icon: Icon; label: string; amount?: number }

export type Turn =
  | { who: 'customer'; text: string; pause?: number }
  | {
      who: 'radioso'
      text: string
      /** How long the typing beat runs before this reply lands. */
      think?: number
      /** A copy-paste snippet rendered inside the bubble, after the text. */
      code?: string
      /** Citation chips rendered inside the bubble — numbered in array order. */
      sources?: string[]
      actions?: Action[]
      /** Gap between action rows — the closing set gets more room. */
      actionGap?: number
      note?: Piece[]
      pause?: number
    }

/** Beat lengths, in ms. Tuned so closing action rows get the most air. */
const LEAD_IN = 300 // a breath at the top of the track before the first line lands
const DEFAULT_THINK = 620
const DEFAULT_PAUSE = 520
const ACTION_LEAD = 300 // from a reply landing to its first action row
const ACTION_TAIL = 820 // from the last action row to the note that follows
const COUNT_LAG = 120 // a figure starts rolling as its row is still fading in
const COUNT_MS = 620
/** A plain row is confirmed almost at once; a row with a figure waits for it to land. */
const CHECK_LAG = 300
const MONEY_CHECK_LAG = COUNT_LAG + COUNT_MS - 20
/** After the last mark: room for its own animation and any figure to finish. */
export const SETTLE = 900
/** How long the transcript takes to slide up to its new resting place. `--dur-base`. */
const CHAT_SCROLL_MS = 420

export type TurnPlan = {
  typingAt: number | null
  typingFor: number
  textAt: number
  actionsAt: number[]
  noteAt: number | null
  /** Avatars sit at the bottom of their turn, so they arrive with the turn's last line. */
  avatarAt: number
}

/** Lays a whole conversation out on one timeline. Pure — call it at module scope. */
export function planChat(chat: Turn[]): TurnPlan[] {
  let t = LEAD_IN

  return chat.map((turn) => {
    const plan: TurnPlan = {
      typingAt: null,
      typingFor: 0,
      textAt: t,
      actionsAt: [],
      noteAt: null,
      avatarAt: t,
    }

    if (turn.who === 'radioso') {
      plan.typingFor = turn.think ?? DEFAULT_THINK
      plan.typingAt = t
      t += plan.typingFor
      plan.textAt = t
    }

    if (turn.who === 'radioso' && turn.actions?.length) {
      const actions = turn.actions
      const gap = turn.actionGap ?? 300
      t += ACTION_LEAD
      actions.forEach((_, i) => {
        plan.actionsAt.push(t)
        if (i < actions.length - 1) t += gap
      })
      t += ACTION_TAIL
    }

    if (turn.who === 'radioso' && turn.note) {
      plan.noteAt = t
    }

    plan.avatarAt = plan.noteAt ?? plan.actionsAt[plan.actionsAt.length - 1] ?? plan.textAt
    t += turn.pause ?? DEFAULT_PAUSE
    return plan
  })
}

/** The point on the timeline where the scene is finished: last mark plus a settle. */
export function sceneEnd(plan: TurnPlan[]): number {
  let end = 0
  for (const p of plan) {
    end = Math.max(end, p.textAt, p.avatarAt, p.noteAt ?? 0, ...p.actionsAt)
    if (p.typingAt !== null) end = Math.max(end, p.typingAt + p.typingFor)
  }
  return end + SETTLE
}

export type ChatScript = { kind: 'chat'; chat: Turn[]; plan: TurnPlan[] }

/**
 * A scene that is not a conversation: a diagram on the same clock. It has no
 * transcript to measure, so it states its own timeline: `start` is the frame the
 * top of the track shows, `end` the frame where it is finished.
 */
export type DiagramScript = { kind: 'diagram'; start: number; end: number }

export type SceneScript = ChatScript | DiagramScript

export const delay = (ms: number) => ({ '--scene-delay': `${ms}ms` }) as CSSProperties

export const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* ---------------------------------------------------------------------------
   The scene clock.

   Scroll position, not a timer, is the transport: the track in agent-demos.tsx
   turns scroll progress into a point on the same `planChat` timeline and pushes
   it here once per frame. Everything downstream is a pure function of `t`, which
   is why scrubbing backwards costs nothing — the CSS animations are paused and
   positioned by a negative `animation-delay`, and the two things CSS can't do
   (the transcript's own scroll offset and the dollar figures) read `t` straight
   off the clock and write to the DOM without a re-render.
   --------------------------------------------------------------------------- */
/** Everything downstream of the track needs to know, in one object. */
export type SceneFrame = {
  /** Where the scene is, in ms on the `planChat` timeline. */
  t: number
  /** False until the track arms: no JS, or reduced motion, means the finished scene. */
  armed: boolean
  /** The scene has played through once. It stays said, and the card is the visitor's. */
  done: boolean
}

export type SceneClock = {
  /** Registers a frame listener and returns its unsubscribe. */
  subscribe: (fn: (frame: SceneFrame) => void) => () => void
  /** Pushes a new position on the timeline, and whether the scene is finished. */
  emit: (t: number, done: boolean) => void
  /** Called once by the track when it takes over: until then, nothing is hidden. */
  arm: () => void
  /** The current frame, for anything mounting mid-track (a tab switch). */
  read: () => SceneFrame
}

/** State lives in the closure, so the object handed around is never mutated. */
export function createSceneClock(): SceneClock {
  const subs = new Set<(frame: SceneFrame) => void>()
  let frame: SceneFrame = { t: 0, armed: false, done: false }

  return {
    subscribe(fn) {
      subs.add(fn)
      return () => {
        subs.delete(fn)
      }
    },
    emit(t, done) {
      frame = { t, armed: frame.armed, done }
      for (const fn of subs) fn(frame)
    },
    arm() {
      frame = { ...frame, armed: true }
    },
    read: () => frame,
  }
}

const SceneClockContext = createContext<SceneClock | null>(null)

export const SceneClockProvider = SceneClockContext.Provider

/** Subscribes to the clock for the life of the component. `fn` must be stable. */
function useSceneFrame(fn: (frame: SceneFrame) => void) {
  const clock = useContext(SceneClockContext)
  useIsomorphicLayoutEffect(() => {
    if (!clock) return
    fn(clock.read())
    return clock.subscribe(fn)
  }, [clock, fn])
}

/** Where the transcript should sit, in px, once everything up to `at` has landed. */
type ScrollStep = { at: number; y: number }

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

/** Flags "there is conversation above this" for the top fade. */
function markEdge(viewport: HTMLElement) {
  const atTop = viewport.scrollTop < 4
  const next = atTop ? 'true' : 'false'
  if (viewport.dataset.top !== next) viewport.dataset.top = next
}

/**
 * A scripted conversation, scrubbed by the page's scroll position.
 *
 * The card is a chat window: a fixed height with the header strip pinned at the
 * top and the transcript scrolling underneath it, so the newest line is always the
 * one at the bottom edge. Scroll progress drives the container's own `scrollTop`,
 * from offsets measured off the real elements on arm (and again on resize), so the
 * same page position always produces the same frame, forwards or backwards — and
 * once the scene has played out, the visitor can scroll the transcript themselves.
 *
 * Nothing is hidden until JS says so: the served HTML, a visitor without JS, and
 * anyone with `prefers-reduced-motion: reduce` all get the finished conversation
 * at the card's natural full height, in normal flow, with no pinning.
 */
export function ScriptedScene({ script, label }: { script: ChatScript; label: string }) {
  const { chat, plan } = script
  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const stepsRef = useRef<ScrollStep[]>([])
  /** The offset currently written to the node, so a still frame costs no DOM write. */
  const appliedRef = useRef(Number.NaN)
  /** Set once the closing frame is in and the scroll container is the visitor's. */
  const releasedRef = useRef(false)

  /**
   * The transcript's resting `scrollTop` after each beat: everything that has
   * landed by then, measured against the height of the window it is read through.
   * Offsets are differences between two live rects, so the container's own scroll
   * position cancels out and the numbers mean the same thing at any offset.
   */
  const measure = useCallback((): ScrollStep[] => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return []

    // The content box carries the card's own padding, so `top` is the top of the
    // scrollable area and the bottom pad is part of what has to fit.
    const top = content.getBoundingClientRect().top
    const padBottom = parseFloat(getComputedStyle(content).paddingBottom) || 0
    const frame = viewport.clientHeight
    if (frame <= 0) return []

    const marks = [...content.querySelectorAll<HTMLElement>('[data-at]')]
      .map((el) => ({ at: Number(el.dataset.at), bottom: el.getBoundingClientRect().bottom - top }))
      .sort((a, b) => a.at - b.at)

    const steps: ScrollStep[] = []
    let lowest = 0
    for (const mark of marks) {
      lowest = Math.max(lowest, mark.bottom)
      const y = Math.max(0, lowest + padBottom - frame)
      const last = steps[steps.length - 1]
      if (last && last.at === mark.at) last.y = y
      else steps.push({ at: mark.at, y })
    }
    return steps
  }, [])

  const paint = useCallback(({ t, armed, done }: SceneFrame) => {
    const viewport = viewportRef.current
    if (!viewport) return
    if (!armed) {
      viewport.scrollTop = 0
      return
    }
    const steps = stepsRef.current
    if (!steps.length) return
    // Once the scene has played through, the card belongs to the visitor: the
    // clock writes the closing frame one last time and then keeps its hands off,
    // so their own scrolling back through the conversation is never undone.
    if (done && releasedRef.current) return

    // The last step at or before `t`, and how far the slide into it has run.
    let i = -1
    while (i + 1 < steps.length && steps[i + 1].at <= t) i += 1
    const from = i < 0 ? 0 : (steps[i - 1]?.y ?? 0)
    const to = i < 0 ? 0 : steps[i].y
    const p = i < 0 ? 1 : Math.min(1, (t - steps[i].at) / CHAT_SCROLL_MS)
    const y = from + (to - from) * easeOut(p)

    if (done && !releasedRef.current) {
      releasedRef.current = true
      // Give the finished transcript a tab stop of its own, so the conversation
      // is scrollable from the keyboard and not just by wheel or touch.
      viewport.tabIndex = 0
      viewport.setAttribute('role', 'region')
      viewport.setAttribute('aria-label', 'Conversation transcript')
    }

    // Skip the write when nothing moved: a scroll frame in the tail of the track
    // shouldn't touch the DOM at all.
    if (Math.abs(y - appliedRef.current) < 0.5) return
    appliedRef.current = y
    viewport.scrollTop = y
    markEdge(viewport)
  }, [])

  useSceneFrame(paint)

  // Arm before the first paint, while the measurement is still of the finished
  // card: hide the transcript only once we know where every line belongs.
  useIsomorphicLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia(MOTION_QUERY).matches) return

    const steps = measure()
    if (steps.length < 2) return // couldn't measure — leave the finished card alone

    stepsRef.current = steps
    appliedRef.current = Number.NaN
    releasedRef.current = false
    card.dataset.armed = 'true'
  }, [measure])

  // The top fade is history above the fold, so it has no business being there
  // when the visitor has scrolled the conversation back to its first line.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onScroll = () => markEdge(viewport)
    viewport.addEventListener('scroll', onScroll, { passive: true })
    return () => viewport.removeEventListener('scroll', onScroll)
  }, [])

  // Re-measure if the card reflows (font swap, resize, zoom) and repaint at the
  // clock's current position, so a resize mid-track never loses the frame.
  const clock = useContext(SceneClockContext)
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const observer = new ResizeObserver(() => {
      if (card.dataset.armed !== 'true') return
      stepsRef.current = measure()
      appliedRef.current = Number.NaN
      const frame = clock?.read()
      if (frame) paint(frame)
    })
    observer.observe(card)
    return () => observer.disconnect()
  }, [measure, paint, clock])

  return (
    <div
      ref={cardRef}
      className="scene-card surface relative mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-5 py-3.5 sm:px-7">
        <SignalMark className="h-2.5 w-[1.125rem]" color="var(--human)" />
        <span className="text-2xs font-medium text-muted-foreground">{label}</span>
      </div>

      {/* A real scroll container, not a transform: while the scene is being
          scrubbed it is `overflow: hidden` (still scrollable from script, so a
          wheel over the card can't steal the page scroll and break the pin), and
          the moment the scene finishes it becomes the visitor's to scroll. */}
      <div ref={viewportRef} className="scene-viewport no-scrollbar relative min-h-0 flex-1">
        <div ref={contentRef} className="scene-content flex flex-col gap-4 px-5 py-5 sm:px-7">
          {chat.map((turn, i) => (
            <Bubble key={i} turn={turn} plan={plan[i]} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Bubble({ turn, plan }: { turn: Turn; plan: TurnPlan }) {
  const isRadioso = turn.who === 'radioso'
  const noteAt = plan.noteAt
  const entersAt = plan.typingAt ?? plan.textAt

  return (
    <div className={`flex items-end gap-2.5 ${isRadioso ? '' : 'flex-row-reverse'}`}>
      <AvatarTile who={turn.who} at={plan.avatarAt} />
      <div className={`flex max-w-[80%] flex-col gap-1.5 ${isRadioso ? 'items-start' : 'items-end'}`}>
        {isRadioso && (
          <span className="scene-step px-1 text-2xs font-medium text-muted-foreground" style={delay(entersAt)}>
            Radioso
          </span>
        )}
        {/* The typing beat is absolutely positioned at the top of the bubble's own
            box, so it costs no layout and the reply grows downward out of it. */}
        <div className="relative">
          <RadiosoText isRadioso={isRadioso} className="scene-step" at={plan.textAt}>
            {turn.text}
            {isRadioso && turn.code && (
              <pre className="mt-2 overflow-x-auto rounded-lg border border-primary/15 bg-background/60 px-3 py-2 text-left font-mono text-[13px] leading-relaxed">
                {turn.code}
              </pre>
            )}
            {isRadioso && turn.sources && (
              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                {turn.sources.map((title, i) => (
                  <span
                    key={title}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-card px-2 py-px font-mono text-2xs text-muted-foreground"
                  >
                    <span className="font-medium text-primary">{i + 1}</span>
                    {title}
                  </span>
                ))}
              </span>
            )}
          </RadiosoText>
          {plan.typingAt !== null && (
            <TypingBeat at={plan.typingAt} runFor={plan.typingFor} align={isRadioso ? 'left' : 'right'} />
          )}
        </div>
        {isRadioso && turn.actions && (
          <div className="flex w-full flex-col gap-1.5 pt-0.5">
            {turn.actions.map((a, i) => (
              <ActionChip key={a.label} action={a} at={plan.actionsAt[i]} />
            ))}
          </div>
        )}
        {isRadioso && turn.note && noteAt !== null && (
          <RadiosoText isRadioso className="scene-step" at={noteAt}>
            {turn.note.map((piece, i) =>
              typeof piece === 'string' ? (
                piece
              ) : (
                <Figure key={i} value={piece.amount} at={noteAt + COUNT_LAG} />
              ),
            )}
          </RadiosoText>
        )}
      </div>
    </div>
  )
}

function RadiosoText({
  isRadioso,
  className,
  at,
  children,
}: {
  isRadioso: boolean
  className?: string
  at: number
  children: ReactNode
}) {
  return (
    <div
      data-at={at}
      style={delay(at)}
      className={`${
        isRadioso
          ? 'rounded-2xl rounded-bl-md border border-primary/20 bg-primary/10 px-4 py-2.5 text-[15px] leading-relaxed text-foreground'
          : 'rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed text-foreground'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

function TypingBeat({ at, runFor, align }: { at: number; runFor: number; align: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      data-at={at}
      className={`scene-typing absolute top-0 flex items-center gap-1 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2.5 ${
        align === 'right' ? 'right-0 rounded-br-md' : 'left-0 rounded-bl-md'
      }`}
      style={{ '--scene-delay': `${at}ms`, '--scene-typing-dur': `${runFor}ms` } as CSSProperties}
    >
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="size-1.5 rounded-full bg-primary" />
    </div>
  )
}

function ActionChip({ action, at }: { action: Action; at: number }) {
  const { icon: Icon, label, amount } = action

  return (
    <div
      data-at={at}
      className="scene-chip flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[13px] text-foreground/90"
      style={delay(at)}
    >
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="font-medium">
        {label}
        {amount !== undefined && <Figure value={amount} at={at + COUNT_LAG} />}
      </span>
      <Check
        className="scene-check ml-auto size-3 shrink-0 text-primary"
        style={delay(at + (amount === undefined ? CHECK_LAG : MONEY_CHECK_LAG))}
      />
    </div>
  )
}

/**
 * A dollar figure whose value is a function of where the scene is: it rolls up as
 * the visitor scrolls through its beat and rolls back down when they scroll back.
 * React renders the real number, so the served HTML, a visitor without JS and a
 * reduced-motion visitor are all correct without waiting on anything; the clock
 * then writes the scrubbed value straight to the node, off React's books. Tabular
 * digits plus a reserved min-width mean the count can never re-wrap its line.
 */
function Figure({ value, at }: { value: number; at: number }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const shownRef = useRef<number | null>(null)

  const paint = useCallback(
    ({ t, armed }: SceneFrame) => {
      const node = ref.current
      if (!node) return
      const p = armed ? Math.min(1, Math.max(0, (t - at) / COUNT_MS)) : 1
      const next = Math.round(easeOut(p) * value)
      if (next === shownRef.current) return
      shownRef.current = next
      node.textContent = `$${next.toLocaleString('en-US')}`
    },
    [at, value],
  )

  useSceneFrame(paint)

  return (
    <span
      ref={ref}
      className="inline-block tabular-nums"
      style={{ minWidth: `${`$${value.toLocaleString('en-US')}`.length}ch` }}
    >
      {`$${value.toLocaleString('en-US')}`}
    </span>
  )
}

function AvatarTile({ who, at }: { who: Turn['who']; at: number }) {
  if (who === 'radioso') {
    return (
      <div
        className="scene-step flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))]"
        style={delay(at)}
      >
        <Image src="/radioso-icon.svg" alt="Radioso" width={20} height={20} className="size-5" />
      </div>
    )
  }
  return (
    <div
      className="scene-step flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-human/35 bg-human/10"
      style={delay(at)}
    >
      <PixelSprite grid={AVATAR_CUSTOMER.grid} palette={AVATAR_CUSTOMER.palette} className="size-8" title="Someone" />
    </div>
  )
}
