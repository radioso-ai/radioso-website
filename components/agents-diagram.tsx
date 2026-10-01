'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Bot, Check, Compass, FileText, Headset, Plug, Quote, Route, ShieldCheck, Workflow, Wrench } from 'lucide-react'
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
 *   your agent is there → Claude lights → its wire reaches the agent card your
 *   domain serves at /.well-known → the MCP channel opens toward the agent → the
 *   question travels in → the agent works its loop (directives steer, the answer
 *   is grounded with a citation, a routine is readied) → the answer travels back
 *   → the other clients connect → handoff lights last, with your rules.
 */
export const AGENTS_BEATS = {
  agent: 300,
  /** Claude comes online and its wire opens toward you. */
  ask: 1000,
  /** Discovery: a signal runs from Claude to the agent card, which lights with its caption. */
  dStub: 1100,
  dReach: 1400,
  card: 1700,
  /** The channel opens from the client side in: bus, the MCP server, the agent. */
  rightBus: 2300,
  midTrunk: 2500,
  leftTrunk: 2700,
  mcp: 2880,
  /** The question lands in the log as it sets off, and travels in. */
  question: 3200,
  qStub: 3400,
  qBus: 3700,
  qMid: 4000,
  qLeft: 4300,
  arrive: 4600,
  /** The loop, lane by lane, with the action rows it produces. */
  directives: 4800,
  citations: 5200,
  checked: 5300,
  routines: 5800,
  ready: 5900,
  skills: 6200,
  /** The answer, back the way the question came. */
  aLeft: 6600,
  aMid: 6900,
  aBus: 7200,
  aStub: 7500,
  answer: 7720,
  /** ChatGPT, Cursor, any MCP client: the same channel, one after another. */
  clients: [8400, 8700, 9000],
  /** A person stays in the loop where your rules put one. */
  handoff: 9600,
  rules: 9700,
} as const

const B = AGENTS_BEATS

export const AGENTS_SCENE: DiagramScript = {
  kind: 'diagram',
  // Your agent is already there at the top of the track, so a deep link or a slow
  // approach lands on a diagram that has started rather than a grey skeleton.
  start: B.agent + 420,
  end: B.rules + LIGHT + SETTLE,
}

/* The agent's loop, in the platform diagram's vocabulary. Grounding is one lane of
   five: the agent at the centre steers, acts and hands off, it does not just fetch. */
const LANES: { icon: Icon; title: string; verb: string; at: number; human?: boolean }[] = [
  { icon: Compass, title: 'Directives', verb: 'steer', at: B.directives },
  { icon: Quote, title: 'Citations', verb: 'ground', at: B.citations },
  { icon: Route, title: 'Routines', verb: 'guide', at: B.routines },
  { icon: Wrench, title: 'Skills', verb: 'act', at: B.skills },
  { icon: Headset, title: 'Handoff', verb: 'to a person', at: B.handoff, human: true },
]

/* Text labels and one generic glyph, never the vendors' own marks. Claude asks;
   the other three connect afterwards. */
const CLIENTS: { icon: Icon; label: string; at: number }[] = [
  { icon: Bot, label: 'Claude', at: B.ask },
  { icon: Bot, label: 'ChatGPT', at: B.clients[0] + 120 },
  { icon: Bot, label: 'Cursor', at: B.clients[1] + 120 },
  { icon: Plug, label: 'Any MCP client', at: B.clients[2] + 120 },
]

const ACTIONS: { icon: Icon; label: string; at: number }[] = [
  { icon: FileText, label: 'Checked billing policy · billing-faq', at: B.checked },
  { icon: Workflow, label: 'Routine ready · pause subscription', at: B.ready },
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

function Tile({ icon: Icon, label, at }: { icon: Icon; label: string; at: number }) {
  return (
    <div
      className="scene-light relative flex w-full items-center gap-2 rounded-lg border border-primary/35 bg-card px-2 py-1 text-2xs font-medium leading-tight text-foreground sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
      style={cue(at, LIGHT)}
    >
      <Icon className="hidden size-3.5 shrink-0 text-primary sm:block" />
      <span className="whitespace-nowrap">{label}</span>
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

/** One lane of the loop. The handoff lane is a person's, so it lights yellow. */
function Lane({ icon: Icon, title, verb, at, human }: (typeof LANES)[number]) {
  return (
    <li
      className={`scene-light flex items-center gap-1.5 whitespace-nowrap rounded-md border bg-card px-1.5 text-2xs leading-[14px] text-foreground sm:rounded-lg sm:leading-[15px] sm:px-2 sm:py-1 sm:text-xs ${
        human ? 'scene-light-human border-human/50' : 'border-primary/35'
      }`}
      style={cue(at, LIGHT)}
    >
      <Icon className={`hidden size-3 shrink-0 sm:block ${human ? 'text-foreground/70' : 'text-primary'}`} />
      <span className="font-medium">{title}</span>
      <span className="hidden italic text-muted-foreground sm:inline">{verb}</span>
    </li>
  )
}

/**
 * The agents-as-customers tab: a diagram instead of a transcript, on the same clock.
 *
 * Left to right: your agent and its loop, how the conversation arrives (the agent
 * card your domain serves, then the MCP channel), and the assistants asking. MCP is
 * the way in, not the product: the thing at the centre is the same agent that
 * steers, acts and hands off on your site.
 *
 * Every lit state is the resting state. The served HTML, a visitor without JS and
 * a reduced-motion visitor get the finished picture. Only once the card arms
 * (`data-armed`) is it wound back to the grey skeleton, and from there each element
 * is a paused CSS animation positioned by `--scene-t`, exactly like the chat
 * scenes, so scrolling back rewinds it.
 *
 * It sits in the same fixed-height card as the transcripts and never scrolls. On a
 * phone the action rows give way: the lanes lighting carry that beat.
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

      <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-2 sm:px-7 sm:py-4">
        <div className="mx-auto grid h-[7.25rem] w-full grid-cols-[minmax(0,auto)_0.75rem_5.5rem_0.75rem_minmax(0,auto)] justify-center sm:h-48 sm:grid-cols-[minmax(0,auto)_2.5rem_8.5rem_2.5rem_minmax(0,10rem)]">
          {/* Your agent: the Radioso mark and its loop. */}
          <div className="relative self-center">
            <div
              className="scene-light relative flex items-center gap-2.5 rounded-xl border border-primary/35 bg-[color-mix(in_oklab,var(--primary)_5%,var(--card))] px-1.5 py-3 sm:gap-3 sm:px-3 sm:py-4"
              style={cue(B.agent, LIGHT)}
            >
              <div className="relative hidden size-10 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))] sm:flex">
                <Image src="/radioso-icon.svg" alt="" width={24} height={24} className="size-6" />
                {/* The question arriving. */}
                <span aria-hidden className="scene-ping rounded-[inherit]" style={cue(B.arrive)} />
              </div>
              <ul className="flex flex-col gap-0.5 sm:gap-1.5" aria-label="What your agent does">
                {LANES.map((lane) => (
                  <Lane key={lane.title} {...lane} />
                ))}
              </ul>
            </div>
            {/* Labels set into the panel's border, so they cost no height. */}
            <span className="absolute left-1/2 top-0 z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-card px-1.5 text-2xs font-semibold text-foreground">
              <Image src="/radioso-icon.svg" alt="" width={12} height={12} className="size-3 sm:hidden" />
              Your agent
              {/* On a phone the mark lives here, so the question lands here. */}
              <span aria-hidden className="scene-ping rounded-[inherit] sm:hidden" style={cue(B.arrive)} />
            </span>
            <span className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <Caption icon={ShieldCheck} label="Your rules" at={B.rules} />
            </span>
          </div>

          {/* Agent to channel. */}
          <div aria-hidden className="relative">
            <Wire at={B.leftTrunk} axis="x" origin="origin-right" style={{ left: 0, right: 0, top: '50%' }} />
            <Dot at={B.qLeft} from="100% 0" to="0 0" style={{ left: 0, right: 0, top: '50%', height: 1 }} />
            <Dot at={B.aLeft} from="0 0" to="100% 0" style={{ left: 0, right: 0, top: '50%', height: 1 }} />
          </div>

          {/* How the conversation arrives: the agent card on Claude's row, the MCP
              server on the channel. */}
          <div className="relative">
            <Wire at={B.dReach} axis="x" origin="origin-right" style={{ left: '50%', right: 0, top: row(0, 4) }} />
            <Dot at={B.dReach} from="100% 0" to="0 0" style={{ left: '50%', right: 0, top: row(0, 4), height: 1 }} />
            <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ top: row(0, 4) }}>
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

            <Wire at={B.midTrunk} axis="x" origin="origin-right" style={{ left: 0, right: 0, top: '50%' }} />
            <Dot at={B.qMid} from="100% 0" to="0 0" style={{ left: 0, right: 0, top: '50%', height: 1 }} />
            <Dot at={B.aMid} from="0 0" to="100% 0" style={{ left: 0, right: 0, top: '50%', height: 1 }} />
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <Caption label="MCP server" at={B.mcp} mono pings={[B.qMid + 150]} />
            </div>
          </div>

          {/* The clients' side: one bus, a stub per client. */}
          <div aria-hidden className="relative">
            <Wire at={B.rightBus} axis="y" origin="origin-top" style={{ left: 0, top: row(0, 4), bottom: '50%' }} />
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
            {/* Discovery, then the question in and the answer back, along Claude's route. */}
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
            assistant on the right, the agent on the left. */}
        <div className="mt-2.5 flex flex-col gap-1 sm:mt-5 sm:gap-2">
          <div className="flex flex-col items-end gap-1">
            <span
              className="scene-step hidden items-center gap-1 px-1 text-2xs font-medium text-muted-foreground sm:inline-flex"
              style={delay(B.question)}
            >
              <Bot className="size-3" /> Claude, asking for a customer
            </span>
            <p
              className="scene-step max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3 py-1 text-[13px] leading-relaxed text-foreground sm:px-4 sm:py-2 sm:text-[15px]"
              style={delay(B.question)}
            >
              Can I pause my subscription?
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:gap-1.5">
            <span
              className="scene-step hidden px-1 text-2xs font-medium text-muted-foreground sm:inline"
              style={delay(B.checked)}
            >
              Radioso
            </span>
            <div className="hidden flex-wrap gap-1.5 sm:flex">
              {ACTIONS.map(({ icon: Icon, label, at }) => (
                <div
                  key={label}
                  className="scene-chip flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-[13px] text-foreground/90"
                  style={delay(at)}
                >
                  <Icon className="size-3.5 shrink-0 text-primary" />
                  <span className="font-medium">{label}</span>
                  <Check className="scene-check size-3 shrink-0 text-primary" style={delay(at + 300)} />
                </div>
              ))}
            </div>
            <p
              className="scene-step max-w-[85%] rounded-2xl rounded-bl-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-[13px] leading-relaxed text-foreground sm:px-4 sm:py-2 sm:text-[15px]"
              style={delay(B.answer)}
            >
              Yes, for up to three months. Want me to start the pause? I’ll need the account email.{' '}
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
