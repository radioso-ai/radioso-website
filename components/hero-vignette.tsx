'use client'

import { TimedScene } from '@/components/scene-engine'
import { HERO_SUPPORT_SCENE } from '@/components/scenes'

/**
 * The product in context: a browser window on a fictional customer's billing page, with
 * the Radioso widget open in its corner, resolving the support scene's ticket on a timer.
 *
 * It is a picture, not a control: hidden from assistive tech as a whole, but the
 * transcript stays in the served HTML the way the demo scenes do. The page behind the
 * widget is deliberately abstract. Only "Acme" and "Billing" are words; everything else
 * is a grey bar, so the eye goes to the conversation.
 *
 * Below `lg` the browser frame drops away and the widget stands alone, full width under
 * the calls to action.
 */
export function HeroVignette() {
  return (
    <div
      aria-hidden
      className="rise-in relative"
      style={{ '--rise-delay': '360ms' } as React.CSSProperties}
    >
      <div className="lg:relative lg:h-[540px] lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:bg-background lg:shadow-lg lg:shadow-black/10 lg:ring-1 lg:ring-black/[0.03] dark:lg:shadow-black/30 dark:lg:ring-white/[0.06]">
        <BrowserChrome />
        <AcmeBillingPage />
        <TimedScene
          script={HERO_SUPPORT_SCENE}
          label="Acme support"
          className="mx-auto h-[min(64vh,520px)] w-full max-w-xl lg:absolute lg:bottom-5 lg:right-5 lg:h-[420px] lg:w-[320px] lg:max-w-none"
        />
      </div>
    </div>
  )
}

/** Three dots and an empty address bar: enough to say "a website", nothing to read. */
function BrowserChrome() {
  return (
    <div className="hidden h-10 items-center gap-4 border-b border-border bg-card px-4 lg:flex">
      <div className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="mx-auto h-5 w-2/5 rounded-md bg-muted" />
      <div className="w-[42px]" />
    </div>
  )
}

const Bar = ({ className }: { className: string }) => (
  <span className={`block rounded-full bg-muted ${className}`} />
)

/** Acme's account billing page, as grey structure. Left-weighted, because the widget covers the right. */
function AcmeBillingPage() {
  return (
    <div className="hidden lg:block">
      <div className="flex h-12 items-center gap-6 border-b border-border/70 px-6">
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-md bg-foreground/80" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Acme</span>
        </div>
        <div className="flex items-center gap-4">
          <Bar className="h-2 w-12" />
          <Bar className="h-2 w-14" />
          <Bar className="h-2 w-10" />
        </div>
        <span className="ml-auto size-6 rounded-full bg-muted" />
      </div>

      <div className="px-6 pt-6">
        <p className="text-xl font-semibold tracking-tight text-foreground">Billing</p>
        <Bar className="mt-2.5 h-2 w-44" />

        <div className="mt-6 w-full max-w-[19rem] rounded-xl border border-border bg-card p-4">
          <Bar className="h-2.5 w-20 bg-foreground/15" />
          <Bar className="mt-3 h-5 w-28 bg-foreground/10" />
          <Bar className="mt-4 h-2 w-full" />
          <Bar className="mt-2 h-2 w-4/5" />
          <span className="mt-4 block h-7 w-24 rounded-md bg-primary/20" />
        </div>

        <div className="mt-6 w-full max-w-[19rem]">
          <Bar className="h-2.5 w-24 bg-foreground/15" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-4 border-b border-border/70 py-3">
              <Bar className="h-2 w-16" />
              <Bar className="h-2 w-10" />
              <Bar className="ml-auto h-2 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
