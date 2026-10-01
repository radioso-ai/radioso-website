'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Bot, BookOpen, Database, Plug, ScrollText, ShieldCheck } from 'lucide-react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'

import { SignalMark } from '@/components/pixel-sprite'
import {
  MOTION_QUERY,
  SETTLE,
  delay,
  useIsomorphicLayoutEffect,
  type DiagramScript,
} from '@/components/scene-engine'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** How long a signal takes to cross one wire segment, and a wire to draw itself lit. */
const SEG = 300
const DRAW = 360
/** A tile's light-up (`scene-light`): long enough for its ring to read. */
const LIGHT = 600

/**
 * The beat table, in ms on the same timeline the chat scenes use. Scroll position
 * picks the frame; these only set the order and spacing of what lights.
 *
 *   sources light → their wires converge on Radioso → Radioso pulses → Claude
 *   lights → its wire runs past the channel to the agent card your domain serves
 *   at /.well-known → the MCP channel opens, walk-in, with nothing to sign up
 *   for → the question travels right to left → Radioso pulses, checks the help center and policies → the cited
 *   answer travels back → the other clients connect → your rules light.
 */
export const AGENTS_BEATS = {
  sources: [300, 640, 980],
  leftBus: 1220,
  leftTrunk: 1440,
  hub: 1680,
  /** Claude comes online and its wire opens toward you. */
  ask: 2200,
  /** Discovery: a signal runs from Claude to the agent card, which lights with its caption. */
  dStub: 2300,
  dReach: 2600,
  card: 2900,
  /** Then the walk-in MCP channel opens: trunk out of Radioso, bus, the label. */
  rightTrunk: 3500,
  rightBus: 3740,
  mcp: 3920,
  /** The question lands in the log as it sets off. */
  question: 4300,
  qStub: 4500,
  qBus: 4800,
  qTrunk: 5100,
  arrive: 5400,
  /** Help center, then policies: what the answer is checked against. */
  lookup: [5600, 5760],
  aTrunk: 6080,
  aBus: 6380,
  aStub: 6680,
  answer: 6900,
  /** ChatGPT, Cursor, any MCP client: the same channel, one after another. */
  clients: [7600, 7900, 8200],
  rules: 8820,
} as const

const B = AGENTS_BEATS

export const AGENTS_SCENE: DiagramScript = {
  kind: 'diagram',
  // The first beat has already landed at the top of the track (the help center lit,
  // the policies starting), so a deep link or a slow approach lands on a diagram
  // that has started rather than a grey skeleton.
  start: B.sources[0] + 420,
  end: B.rules + LIGHT + SETTLE,
}

const SOURCES: { icon: Icon; label: string }[] = [
  { icon: BookOpen, label: 'Help center' },
  { icon: ScrollText, label: 'Policies' },
  { icon: Database, label: 'Product data' },
]

/* Text labels and one generic glyph, never the vendors' own marks. Claude asks;
   the other three connect afterwards. */
const CLIENTS: { icon: Icon; label: string; at: number }[] = [
  { icon: Bot, label: 'Claude', at: B.ask },
  { icon: Bot, label: 'ChatGPT', at: B.clients[0] + 120 },
  { icon: Bot, label: 'Cursor', at: B.clients[1] + 120 },
  { icon: Plug, label: 'Any MCP client', at: B.clients[2] + 120 },
]

/** Centre of row `i` of `n` equal rows, as a CSS length. */
const row = (i: number, n: number) => `${((i + 0.5) / n) * 100}%`

const cue = (at: number, dur?: number, extra?: Record<string, string>) =>
  ({ ...delay(at), ...(dur ? { '--scene-dur': `${dur}ms` } : null), ...extra }) as CSSProperties

/**
 * A hairline in the resting skeleton, with its lit copy drawn over it. `origin` is
 * the end the light starts from, which is the direction the signal travels.
 */
function Wire({
  at,
  axis,
  origin,
  style,
}: {
  at: number
  axis: 'x' | 'y'
  origin: 'origin-left' | 'origin-right' | 'origin-top' | 'origin-bottom'
  style: CSSProperties
}) {
  return (
    <span aria-hidden className={`absolute bg-border ${axis === 'x' ? 'h-px' : 'w-px'}`} style={style}>
      <span
        className={`scene-draw scene-draw-${axis} absolute inset-0 bg-primary/50 ${origin}`}
        style={cue(at, DRAW)}
      />
    </span>
  )
}

/** A single signal crossing one segment. `from`/`to` are `translate` values. */
function Dot({ at, from, to, style }: { at: number; from: string; to: string; style: CSSProperties }) {
  return (
    <span aria-hidden className="absolute" style={style}>
      <span className="scene-dot" style={cue(at, SEG, { '--dot-from': from, '--dot-to': to })} />
    </span>
  )
}

function Tile({ icon: Icon, label, at, pings = [] }: { icon: Icon; label: string; at: number; pings?: number[] }) {
  return (
    <div
      className="scene-light relative flex w-full items-center gap-2 rounded-lg border border-primary/35 bg-card px-2 py-1 text-2xs font-medium leading-tight text-foreground sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
      style={cue(at, LIGHT)}
    >
      <Icon className="hidden size-3.5 shrink-0 text-primary sm:block" />
      <span className="whitespace-nowrap">{label}</span>
      {pings.map((p) => (
        <span key={p} aria-hidden className="scene-ping rounded-[inherit]" style={cue(p)} />
      ))}
    </div>
  )
}

function Caption({
  icon: Icon,
  label,
  at,
  mono = false,
  pings = [],
}: {
  icon?: Icon
  label: string
  at: number
  mono?: boolean
  pings?: number[]
}) {
  return (
    <span
      className={`scene-light relative inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-primary/35 bg-card px-2 py-0 text-2xs text-foreground/85 sm:py-0.5 ${
        mono ? 'font-mono' : 'font-medium'
      }`}
      style={cue(at, LIGHT)}
    >
      {Icon && <Icon className="hidden size-3 shrink-0 text-primary sm:block" />}
      {label}
      {pings.map((p) => (
        <span key={p} aria-hidden className="scene-ping rounded-[inherit]" style={cue(p)} />
      ))}
    </span>
  )
}

/**
 * The agents-as-customers tab: a diagram instead of a transcript, on the same clock.
 *
 * Every lit state is the resting state. The served HTML, a visitor without JS and
 * a reduced-motion visitor get the finished picture: every source, wire, client and
 * label lit, the question and its cited answer in the log. Only once the card arms
 * (`data-armed`) is it wound back to the grey skeleton, and from there each element
 * is a paused CSS animation positioned by `--scene-t`, exactly like the chat
 * scenes, so scrolling back rewinds it.
 *
 * It sits in the same fixed-height card as the transcripts and never scrolls.
 */
export function AgentsDiagramScene({ label }: { label: string }) {
  const cardRef = useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia(MOTION_QUERY).matches) return
    card.dataset.armed = 'true'
  }, [])

  return (
    <div
      ref={cardRef}
      className="scene-card surface relative mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-5 py-3.5 sm:px-7">
        <SignalMark className="h-2.5 w-[1.125rem]" color="var(--primary)" />
        <span className="text-2xs font-medium text-muted-foreground">{label}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-2 sm:px-7 sm:py-5">
        <div className="mx-auto grid h-32 w-full grid-cols-[minmax(0,auto)_0.875rem_5.75rem_0.875rem_minmax(0,auto)] justify-center sm:h-60 sm:grid-cols-[minmax(0,10rem)_2.5rem_8.5rem_2.5rem_minmax(0,10rem)]">
          <ul className="grid grid-rows-3" aria-label="What Radioso answers from">
            {SOURCES.map((s, i) => (
              <li key={s.label} className="self-center">
                <Tile
                  icon={s.icon}
                  label={s.label}
                  at={B.sources[i]}
                  pings={i === 0 ? [B.lookup[0]] : i === 1 ? [B.lookup[1], B.rules] : []}
                />
              </li>
            ))}
          </ul>

          {/* Sources into the bus, the bus converging on its middle. */}
          <div aria-hidden className="relative">
            {SOURCES.map((s, i) => (
              <Wire
                key={s.label}
                at={B.sources[i] + 120}
                axis="x"
                origin="origin-left"
                style={{ left: 0, right: 0, top: row(i, 3) }}
              />
            ))}
            <Wire at={B.leftBus} axis="y" origin="origin-top" style={{ right: 0, top: row(0, 3), bottom: '50%' }} />
            <Wire at={B.leftBus} axis="y" origin="origin-bottom" style={{ right: 0, top: '50%', bottom: row(0, 3) }} />
          </div>

          {/* Radioso, with the trunks running in under its tile from either side, and
              the agent card above it on Claude's row: the first thing an assistant reads. */}
          <div className="relative">
            <Wire at={B.dReach} axis="x" origin="origin-right" style={{ left: '50%', right: 0, top: row(0, 4) }} />
            <Dot at={B.dReach} from="100% 0" to="0 0" style={{ left: '50%', right: 0, top: row(0, 4), height: 1 }} />
            <div
              className="absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ top: row(0, 4) }}
            >
              <Caption label="agent card" at={B.card} mono pings={[B.card]} />
            </div>
            {/* Where the card lives. Desktop only: on a phone the rail step beside
                this beat says it, and the card has no room for a second line. */}
            <span
              className="scene-step absolute left-1/2 z-10 hidden w-full -translate-x-1/2 text-balance text-center text-2xs leading-tight text-muted-foreground sm:block"
              style={{ ...delay(B.card + 100), top: `calc(${row(0, 4)} + 1rem)` }}
            >
              <span className="font-mono">/.well-known</span>, on your domain
            </span>

            <Wire at={B.leftTrunk} axis="x" origin="origin-left" style={{ left: 0, right: '50%', top: '50%' }} />
            <Wire at={B.rightTrunk} axis="x" origin="origin-left" style={{ left: '50%', right: 0, top: '50%' }} />
            <Dot at={B.qTrunk} from="100% 0" to="0 0" style={{ left: '50%', right: 0, top: '50%', height: 1 }} />
            <Dot at={B.aTrunk} from="0 0" to="100% 0" style={{ left: '50%', right: 0, top: '50%', height: 1 }} />

            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div
                className="scene-light relative flex size-8 items-center justify-center rounded-lg border border-primary/35 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))] sm:size-14 sm:rounded-2xl"
                style={cue(B.hub, LIGHT)}
              >
                <Image src="/radioso-icon.svg" alt="Radioso" width={28} height={28} className="size-4 sm:size-7" />
                <span aria-hidden className="scene-ping rounded-[inherit]" style={cue(B.hub)} />
                <span aria-hidden className="scene-ping rounded-[inherit]" style={cue(B.arrive)} />
              </div>
              <div className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 flex-col items-center gap-1 sm:mt-2.5 sm:gap-1.5">
                <Caption label="MCP server" at={B.mcp} mono />
                <Caption icon={ShieldCheck} label="Your rules" at={B.rules} />
              </div>
            </div>
          </div>

          {/* The MCP channel: one bus out to every client. */}
          <div aria-hidden className="relative">
            <Wire at={B.rightBus} axis="y" origin="origin-bottom" style={{ left: 0, top: row(0, 4), bottom: '50%' }} />
            <Wire at={B.rightBus} axis="y" origin="origin-top" style={{ left: 0, top: '50%', bottom: row(0, 4) }} />
            {CLIENTS.map((c, i) => (
              <Wire
                key={c.label}
                at={i === 0 ? B.ask : B.clients[i - 1]}
                axis="x"
                // Claude's wire lights from Claude's end: it is the one asking.
                origin={i === 0 ? 'origin-right' : 'origin-left'}
                style={{ left: 0, right: 0, top: row(i, 4) }}
              />
            ))}
            {/* Discovery first, then the question in and the answer back, along Claude's route. */}
            <Dot at={B.dStub} from="100% 0" to="0 0" style={{ left: 0, right: 0, top: row(0, 4), height: 1 }} />
            <Dot at={B.qStub} from="100% 0" to="0 0" style={{ left: 0, right: 0, top: row(0, 4), height: 1 }} />
            <Dot at={B.qBus} from="0 0" to="0 100%" style={{ left: 0, width: 1, top: row(0, 4), bottom: '50%' }} />
            <Dot at={B.aBus} from="0 100%" to="0 0" style={{ left: 0, width: 1, top: row(0, 4), bottom: '50%' }} />
            <Dot at={B.aStub} from="0 0" to="100% 0" style={{ left: 0, right: 0, top: row(0, 4), height: 1 }} />
          </div>

          <ul className="grid grid-rows-4" aria-label="Assistants that can ask it">
            {CLIENTS.map((c) => (
              <li key={c.label} className="self-center">
                <Tile icon={c.icon} label={c.label} at={c.at} />
              </li>
            ))}
          </ul>
        </div>

        {/* The exchange itself, in the same bubbles as the chat scenes: the asking
            assistant on the right, Radioso on the left. */}
        <div className="mt-2 flex flex-col gap-1.5 sm:mt-4 sm:gap-2.5">
          <div className="flex flex-col items-end gap-1">
            <span
              className="scene-step hidden items-center gap-1 px-1 text-2xs font-medium text-muted-foreground sm:inline-flex"
              style={delay(B.question)}
            >
              <Bot className="size-3" /> Claude, asking for a customer
            </span>
            <p
              className="scene-step max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3 py-1.5 text-[13px] leading-relaxed text-foreground sm:px-4 sm:py-2.5 sm:text-[15px]"
              style={delay(B.question)}
            >
              Can I pause my subscription?
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span
              className="scene-step hidden px-1 text-2xs font-medium text-muted-foreground sm:inline"
              style={delay(B.answer)}
            >
              Radioso
            </span>
            <p
              className="scene-step max-w-[85%] rounded-2xl rounded-bl-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-[13px] leading-relaxed text-foreground sm:px-4 sm:py-2.5 sm:text-[15px]"
              style={delay(B.answer)}
            >
              Yes. Pause from Billing for up to three months, keep your data.{' '}
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-card px-2 py-px align-[1px] font-mono text-2xs text-muted-foreground">
                <span className="font-medium text-primary">1</span>
                billing-faq
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
