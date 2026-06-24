import Image from 'next/image'
import { Building2, Copy, FileText, BadgeDollarSign, Users, Coins, Check } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { Reveal } from '@/components/reveal'
import {
  PixelSprite,
  SparkMark,
  SPARK_GRID,
  AVATAR_CUSTOMER,
  AVATAR_TEAMMATE,
} from '@/components/pixel-sprite'

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type Action = { icon: Icon; label: string }
type Turn =
  | { who: 'customer'; text: string }
  | { who: 'radioso'; text: string; actions?: Action[]; note?: string }

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
    actions: [
      { icon: Building2, label: 'Pulled account · Acme Inc — Pro, 24 seats' },
      { icon: Copy, label: 'Flagged duplicate charge · Mar 3, $480' },
      { icon: FileText, label: 'Checked billing policy · billing.md' },
    ],
  },
  {
    who: 'radioso',
    text: "Two things: a failed payment retry double-charged you on Mar 3, and you're paying for 24 seats but only 18 are active. I can refund the duplicate and right-size the plan — that's a billing change, so I'll confirm before I touch it.",
  },
  { who: 'customer', text: 'Yes please, go ahead 🙏' },
  {
    who: 'radioso',
    text: 'All done.',
    actions: [
      { icon: BadgeDollarSign, label: 'Refunded duplicate · $480' },
      { icon: Users, label: 'Right-sized plan · 24 → 18 seats' },
      { icon: Coins, label: 'Credited unused seats · $312' },
    ],
    note: "$792 back to you, and next month's invoice drops to $1,440 — I've emailed the updated copy to your finance contact.",
  },
  { who: 'customer', text: "Incredible — that would've taken us an hour. Thank you!" },
]

export function HumanLoop() {
  return (
    <section id="people" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--secondary)" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          It doesn&apos;t just talk. It does the whole thing.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Ask in plain language. Radioso works out what needs to happen, checks your rules, takes
          the actions across your systems, and tells you what it did — looping in a human only when
          it should.
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-14">
        <div className="pixel-grid relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-card/70 p-5 shadow-sm sm:p-7">
          <PixelSprite
            grid={SPARK_GRID}
            palette={{ X: 'var(--secondary)' }}
            className="pixel-spark absolute right-6 top-6 size-5"
            style={{ animationDelay: '0.6s' }}
          />

          <div className="relative mb-5 flex items-center gap-2 border-b border-border/60 pb-3">
            <SparkMark className="size-3.5" color="var(--secondary)" />
            <span className="text-[11px] font-medium text-muted-foreground">an example</span>
          </div>

          <div className="relative flex flex-col gap-4">
            {CHAT.map((turn, i) => (
              <Bubble key={i} turn={turn} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={200} className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-border bg-card/40 px-5 py-4">
        <div className="flex size-10 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-border bg-background/70">
          <PixelSprite grid={AVATAR_TEAMMATE.grid} palette={AVATAR_TEAMMATE.palette} className="size-9" title="A teammate" />
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">When it genuinely needs a person,</span> it
          hands off to a human — with the full conversation and every action it took attached.
        </p>
      </Reveal>

      <p className="mx-auto mt-6 max-w-xl text-center font-serif text-lg italic text-muted-foreground">
        That&apos;s the difference between talking about it and getting it done.
      </p>
    </section>
  )
}

function Bubble({ turn }: { turn: Turn }) {
  const isRadioso = turn.who === 'radioso'

  return (
    <div className={`flex items-end gap-2.5 ${isRadioso ? 'flex-row-reverse' : ''}`}>
      <AvatarTile who={turn.who} />
      <div className={`flex max-w-[80%] flex-col gap-1.5 ${isRadioso ? 'items-end' : 'items-start'}`}>
        {isRadioso && (
          <span className="px-1 text-[10px] font-medium text-muted-foreground">Radioso</span>
        )}
        <RadiosoText isRadioso={isRadioso}>{turn.text}</RadiosoText>
        {isRadioso && turn.actions && (
          <div className="flex w-full flex-col gap-1.5 pt-0.5">
            {turn.actions.map((a) => (
              <ActionChip key={a.label} {...a} />
            ))}
          </div>
        )}
        {isRadioso && turn.note && <RadiosoText isRadioso>{turn.note}</RadiosoText>}
      </div>
    </div>
  )
}

function RadiosoText({ isRadioso, children }: { isRadioso: boolean; children: string }) {
  return (
    <div
      className={
        isRadioso
          ? 'rounded-2xl rounded-br-sm border border-primary/20 bg-primary/10 px-3.5 py-2 text-[13px] leading-relaxed text-foreground'
          : 'rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-[13px] leading-relaxed text-foreground'
      }
    >
      {children}
    </div>
  )
}

function ActionChip({ icon: Icon, label }: Action) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1.5 text-[12px] text-foreground/90">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="font-medium">{label}</span>
      <Check className="ml-auto size-3 shrink-0 text-primary" />
    </div>
  )
}

function AvatarTile({ who }: { who: Turn['who'] }) {
  if (who === 'radioso') {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))]">
        <Image src="/radioso-icon.svg" alt="Radioso" width={20} height={20} className="size-5" />
      </div>
    )
  }
  return (
    <div className="flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-border bg-background/70">
      <PixelSprite grid={AVATAR_CUSTOMER.grid} palette={AVATAR_CUSTOMER.palette} className="size-8" title="Someone" />
    </div>
  )
}
