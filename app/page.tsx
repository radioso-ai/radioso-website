import { SiteFooter } from '@/components/site-footer'
import { PillNav } from '@/components/pill-nav'
import { AskHero } from '@/components/ask-hero'
import { TrustStrip } from '@/components/trust-strip'
import { PlatformDiagram } from '@/components/platform-diagram'
import { ActsSection } from '@/components/acts-section'
import { Quickstart } from '@/components/quickstart'
import { HumanLoop } from '@/components/human-loop'
import { Reveal } from '@/components/reveal'
import { PixelSprite, SPARK_GRID } from '@/components/pixel-sprite'
import { AskProvider } from '@/lib/ask-context'

// Twinkling logo-sparks scattered behind the hero — playful, on-brand confetti.
type HeroSpark = {
  top: string
  left?: string
  right?: string
  size: string
  color: string
  delay: string
}
const HERO_SPARKS: HeroSpark[] = [
  { top: '16%', left: '8%', size: 'size-5', color: 'var(--secondary)', delay: '0s' },
  { top: '30%', right: '10%', size: 'size-6', color: 'var(--primary)', delay: '0.8s' },
  { top: '62%', left: '14%', size: 'size-4', color: 'var(--primary)', delay: '1.6s' },
  { top: '54%', right: '16%', size: 'size-5', color: 'var(--secondary)', delay: '2.1s' },
  { top: '8%', left: '46%', size: 'size-3', color: 'var(--secondary)', delay: '1.2s' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AskProvider>
        <main className="relative flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden"
          >
            <div className="hero-aura" />
            <div className="signal-rings">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-dots" />
            {HERO_SPARKS.map((s, i) => (
              <PixelSprite
                key={i}
                grid={SPARK_GRID}
                palette={{ X: s.color }}
                className={`pixel-spark absolute ${s.size}`}
                style={{ top: s.top, left: s.left, right: s.right, animationDelay: s.delay }}
              />
            ))}
          </div>
          <PillNav />
          <AskHero />
          <TrustStrip />
          <Reveal>
            <PlatformDiagram />
          </Reveal>
          <HumanLoop />
          <Reveal>
            <ActsSection />
          </Reveal>
          <Reveal>
            <Quickstart />
          </Reveal>
        </main>
      </AskProvider>
      <SiteFooter />
    </div>
  )
}
