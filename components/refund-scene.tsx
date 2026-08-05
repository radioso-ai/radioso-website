'use client'

import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Building2, Copy, FileText, BadgeDollarSign, Users, Coins, Check } from 'lucide-react'
import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react'

import { PixelSprite, SparkMark, SPARK_GRID, AVATAR_CUSTOMER } from '@/components/pixel-sprite'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** A number that counts up when the scene plays. Renders its final value on the server. */
type Amount = { amount: number }
type Piece = string | Amount

type Action = { icon: Icon; label: string; amount?: number }

type Turn =
  | { who: 'customer'; text: string; pause?: number }
  | {
      who: 'radioso'
      text: string
      /** How long the typing beat runs before this reply lands. */
      think?: number
      actions?: Action[]
      /** Gap between action rows — the closing set gets more room. */
      actionGap?: number
      note?: Piece[]
      pause?: number
    }

/**
 * A genuinely messy ticket Radioso resolves on its own: it diagnoses a problem
 * the customer didn't even name (overpaying for seats), checks the billing policy,
 * respects a "confirm before billing changes" guardrail, then executes a set of
 * coordinated actions across systems. That's an autonomous resolution agent — not
 * a doc-search box, and not a one-tap refund macro.
 */
const CHAT: Turn[] = [
  {
    who: 'customer',
    text: "We got charged twice this month and the invoice doesn't match our seat count. Can you sort it out?",
  },
  {
    who: 'radioso',
    text: 'On it — let me dig into the account.',
    think: 620,
    // The lookups are quick, overlapping housekeeping — they should feel brisk.
    actionGap: 280,
    actions: [
      { icon: Building2, label: 'Pulled account · Acme Inc — Pro, 24 seats' },
      { icon: Copy, label: 'Flagged duplicate charge · Mar 3, $480' },
      { icon: FileText, label: 'Checked billing policy · billing.md' },
    ],
    pause: 520,
  },
  {
    who: 'radioso',
    // The reasoning beat: it gets the longest think, because this is the moment it
    // works out the thing nobody asked it to look for.
    think: 800,
    text: "Two things: a failed payment retry double-charged you on Mar 3, and you're paying for 24 seats but only 18 are active. I can refund the duplicate and right-size the plan — that's a billing change, so I'll confirm before I touch it.",
    pause: 760,
  },
  { who: 'customer', text: 'Yes please, go ahead 🙏', pause: 520 },
  {
    who: 'radioso',
    text: 'All done.',
    think: 620,
    // The heart of the scene: these three land one at a time, with room to read.
    // Each row gets its own beat — arrive, roll the figure, stamp the check.
    actionGap: 720,
    actions: [
      { icon: BadgeDollarSign, label: 'Refunded duplicate · ', amount: 480 },
      { icon: Users, label: 'Right-sized plan · 24 → 18 seats' },
      { icon: Coins, label: 'Credited unused seats · ', amount: 312 },
    ],
    note: [
      { amount: 792 },
      " back to you, and next month's invoice drops to $1,440 — I've emailed the updated copy to your finance contact.",
    ],
    pause: 820,
  },
  { who: 'customer', text: "Incredible — that would've taken us an hour. Thank you!" },
]

/** Beat lengths, in ms. Tuned so the closing action rows get the most air. */
const LEAD_IN = 300 // lets the card's own Reveal settle before the chat starts
const DEFAULT_THINK = 620
const DEFAULT_PAUSE = 520
const ACTION_LEAD = 300 // from a reply landing to its first action row
const ACTION_TAIL = 820 // from the last action row to the note that follows
const COUNT_LAG = 120 // a figure starts rolling as its row is still fading in
const COUNT_MS = 620
/** A plain row is confirmed almost at once; a row with a figure waits for it to land. */
const CHECK_LAG = 300
const MONEY_CHECK_LAG = COUNT_LAG + COUNT_MS - 20
/** The card grows a touch ahead of each arrival, so nothing lands outside its edge. */
const GROW_LEAD = 80

type TurnPlan = {
  typingAt: number | null
  typingFor: number
  textAt: number
  actionsAt: number[]
  noteAt: number | null
  /** Avatars sit at the bottom of their turn, so they arrive with the turn's last line. */
  avatarAt: number
}

/** Lays the whole conversation out on one timeline, once, at module scope. */
function planChat(chat: Turn[]): TurnPlan[] {
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

const PLAN = planChat(CHAT)

const delay = (ms: number) => ({ '--scene-delay': `${ms}ms` }) as CSSProperties

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Read during render, so the finished figure is what a reduced-motion user ever sees. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  )
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** A height the card should have grown to by a given point in the timeline. */
type GrowStep = { at: number; h: number }

/**
 * The refund conversation, played as a timed sequence the first time it scrolls
 * into view.
 *
 * The transcript itself always sits in normal flow at its full, final height, so
 * the space it needs is reserved exactly and nothing on the page ever moves. What
 * animates is a separate chrome layer — the border, background and grid texture —
 * which starts as a slim header strip and grows to meet each line as it arrives.
 * The not-yet-filled area is therefore ordinary page background, never an empty
 * bordered panel.
 *
 * Nothing is hidden until JS says so: the served HTML, a visitor without JS, and
 * anyone with `prefers-reduced-motion: reduce` all get the finished conversation
 * at the card's natural full height.
 */
export function RefundScene() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const stepsRef = useRef<GrowStep[]>([])
  const appliedRef = useRef(0)
  const armedRef = useRef(false)
  const [playing, setPlaying] = useState(false)

  /**
   * Where the card's bottom edge belongs after each beat: the lowest point of
   * everything that has arrived by then, plus the card's own bottom padding.
   */
  const measure = useCallback((): GrowStep[] => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return []

    const top = container.getBoundingClientRect().top
    const padBottom = parseFloat(getComputedStyle(content).paddingBottom) || 0
    const marks = [...container.querySelectorAll<HTMLElement>('[data-at]')]
      .map((el) => ({ at: Number(el.dataset.at), h: el.getBoundingClientRect().bottom - top + padBottom }))
      .sort((a, b) => a.at - b.at)

    const steps: GrowStep[] = []
    let lowest = 0
    for (const mark of marks) {
      lowest = Math.max(lowest, mark.h)
      const last = steps[steps.length - 1]
      if (last && last.at === mark.at) last.h = lowest
      else steps.push({ at: mark.at, h: lowest })
    }
    return steps
  }, [])

  // Arm before the first paint after hydration — while the section is still well
  // below the fold — so the collapse down to a header strip is never seen.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia(MOTION_QUERY).matches) return

    const steps = measure()
    if (steps.length < 2) return // couldn't measure — leave the finished card alone

    stepsRef.current = steps
    appliedRef.current = 0
    armedRef.current = true
    container.dataset.armed = 'true'
    container.style.setProperty('--chrome-h', `${steps[0].h}px`)
  }, [measure])

  // Re-measure if the card reflows mid-sequence (font swap, resize, zoom).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (!armedRef.current) return
      stepsRef.current = measure()
      const step = stepsRef.current[appliedRef.current]
      if (!step) return
      container.style.setProperty(
        '--chrome-h',
        appliedRef.current >= stepsRef.current.length - 1 ? '100%' : `${step.h}px`,
      )
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlaying(true) // once — the observer disconnects and never re-arms
            observer.disconnect()
          }
        }
      },
      // Fires once the top of the card is comfortably on screen, whatever its height.
      { rootMargin: '0px 0px -20% 0px', threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Grow the card in step with the transcript.
  useEffect(() => {
    const container = containerRef.current
    if (!playing || !container || !armedRef.current) return

    const timers = stepsRef.current.map((step, i) =>
      window.setTimeout(
        () => {
          appliedRef.current = i
          // On the final beat, hand the height back to CSS so the card stays fluid.
          const last = i === stepsRef.current.length - 1
          container.style.setProperty('--chrome-h', last ? '100%' : `${step.h}px`)
        },
        Math.max(0, step.at - GROW_LEAD),
      ),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [playing])

  return (
    <div ref={containerRef} className={`relative mx-auto max-w-xl ${playing ? 'scene-play' : ''}`}>
      <div
        aria-hidden
        className="scene-chrome pixel-grid absolute inset-x-0 top-0 rounded-3xl border border-border bg-card/70 shadow-sm"
      />
      <PixelSprite
        grid={SPARK_GRID}
        palette={{ X: 'var(--secondary)' }}
        className="pixel-spark absolute right-6 top-6 size-5"
        style={{ animationDelay: '0.6s' }}
      />

      <div ref={contentRef} className="relative p-5 sm:p-7">
        <div data-at="0" className="mb-5 flex items-center gap-2 border-b border-border/60 pb-3">
          <SparkMark className="size-3.5" color="var(--secondary)" />
          <span className="text-[11px] font-medium text-muted-foreground">an example</span>
        </div>

        <div className="flex flex-col gap-4">
          {CHAT.map((turn, i) => (
            <Bubble key={i} turn={turn} plan={PLAN[i]} playing={playing} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Bubble({ turn, plan, playing }: { turn: Turn; plan: TurnPlan; playing: boolean }) {
  const isRadioso = turn.who === 'radioso'
  const noteAt = plan.noteAt
  const entersAt = plan.typingAt ?? plan.textAt

  return (
    <div className={`flex items-end gap-2.5 ${isRadioso ? 'flex-row-reverse' : ''}`}>
      <AvatarTile who={turn.who} at={plan.avatarAt} />
      <div className={`flex max-w-[80%] flex-col gap-1.5 ${isRadioso ? 'items-end' : 'items-start'}`}>
        {isRadioso && (
          <span className="scene-step px-1 text-[10px] font-medium text-muted-foreground" style={delay(entersAt)}>
            Radioso
          </span>
        )}
        {/* The typing beat is absolutely positioned at the top of the bubble's own
            box, so it costs no layout and the reply grows downward out of it. */}
        <div className="relative">
          <RadiosoText isRadioso={isRadioso} className="scene-step" at={plan.textAt}>
            {turn.text}
          </RadiosoText>
          {plan.typingAt !== null && (
            <TypingBeat at={plan.typingAt} runFor={plan.typingFor} align={isRadioso ? 'right' : 'left'} />
          )}
        </div>
        {isRadioso && turn.actions && (
          <div className="flex w-full flex-col gap-1.5 pt-0.5">
            {turn.actions.map((a, i) => (
              <ActionChip key={a.label} action={a} at={plan.actionsAt[i]} playing={playing} />
            ))}
          </div>
        )}
        {isRadioso && turn.note && noteAt !== null && (
          <RadiosoText isRadioso className="scene-step" at={noteAt}>
            {turn.note.map((piece, i) =>
              typeof piece === 'string' ? (
                piece
              ) : (
                <Figure key={i} value={piece.amount} at={noteAt + COUNT_LAG} playing={playing} />
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
          ? 'rounded-2xl rounded-br-sm border border-primary/20 bg-primary/10 px-3.5 py-2 text-[13px] leading-relaxed text-foreground'
          : 'rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-[13px] leading-relaxed text-foreground'
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
        align === 'right' ? 'right-0 rounded-br-sm' : 'left-0 rounded-bl-sm'
      }`}
      style={{ '--scene-delay': `${at}ms`, '--scene-typing-dur': `${runFor}ms` } as CSSProperties}
    >
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="size-1.5 rounded-full bg-primary" />
    </div>
  )
}

function ActionChip({ action, at, playing }: { action: Action; at: number; playing: boolean }) {
  const { icon: Icon, label, amount } = action

  return (
    <div
      data-at={at}
      className="scene-chip flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1.5 text-[12px] text-foreground/90"
      style={delay(at)}
    >
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="font-medium">
        {label}
        {amount !== undefined && <Figure value={amount} at={at + COUNT_LAG} playing={playing} />}
      </span>
      <Check
        className="scene-check ml-auto size-3 shrink-0 text-primary"
        style={delay(at + (amount === undefined ? CHECK_LAG : MONEY_CHECK_LAG))}
      />
    </div>
  )
}

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

/**
 * A dollar figure that ticks up once the scene reaches it. Its value is derived,
 * not stored: before the scene plays — and always under reduced motion — it renders
 * the real number, so the served HTML and the reduced-motion view are both correct
 * without waiting on a timer. Tabular digits plus a reserved min-width mean the
 * count can never re-wrap the line it sits in.
 */
function Figure({ value, at, playing }: { value: number; at: number; playing: boolean }) {
  const reduced = useReducedMotion()
  const [counted, setCounted] = useState<number | null>(null)
  const shown = playing && !reduced ? (counted ?? 0) : value

  useEffect(() => {
    if (!playing || reduced) return
    let frame = 0
    const timer = window.setTimeout(() => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - startedAt) / COUNT_MS)
        setCounted(Math.round(easeOut(p) * value))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, at)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [playing, reduced, at, value])

  return (
    <span
      className="inline-block tabular-nums"
      style={{ minWidth: `${`$${value.toLocaleString('en-US')}`.length}ch` }}
    >
      {`$${shown.toLocaleString('en-US')}`}
    </span>
  )
}

function AvatarTile({ who, at }: { who: Turn['who']; at: number }) {
  if (who === 'radioso') {
    return (
      <div
        className="scene-step flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))]"
        style={delay(at)}
      >
        <Image src="/radioso-icon.svg" alt="Radioso" width={20} height={20} className="size-5" />
      </div>
    )
  }
  return (
    <div
      className="scene-step flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-border bg-background/70"
      style={delay(at)}
    >
      <PixelSprite grid={AVATAR_CUSTOMER.grid} palette={AVATAR_CUSTOMER.palette} className="size-8" title="Someone" />
    </div>
  )
}
