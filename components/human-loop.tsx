import { Reveal } from '@/components/reveal'
import { RefundScene } from '@/components/refund-scene'
import { PixelSprite, SparkMark, AVATAR_TEAMMATE } from '@/components/pixel-sprite'

export function HumanLoop() {
  return (
    <section id="people" className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <SparkMark className="size-6" color="var(--human)" />
        </div>
        <h2 className="display-serif font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          It knows when to act — and when to ask.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Radioso diagnoses the problem, checks your rules, and does the work. When a rule says a
          person decides, it stops, asks, and hands over cleanly — with everything it already found
          attached.
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-14">
        <RefundScene />
      </Reveal>

      <Reveal delay={200} className="surface mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-2xl px-5 py-4">
        {/* Yellow, not neutral: this tile is the moment a person enters the
            loop, and yellow is the site's marker for exactly that. */}
        <div className="flex size-10 shrink-0 items-end justify-center overflow-hidden rounded-xl border border-human/35 bg-human/10">
          <PixelSprite grid={AVATAR_TEAMMATE.grid} palette={AVATAR_TEAMMATE.palette} className="size-9" title="A teammate" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">When it genuinely needs a person,</span> it
          hands off to a human — with the full conversation and every action it took attached.
        </p>
      </Reveal>

      <p className="display-serif mx-auto mt-6 max-w-xl text-center font-serif text-lg italic text-muted-foreground">
        That&apos;s the difference between talking about it and getting it done.
      </p>
    </section>
  )
}
