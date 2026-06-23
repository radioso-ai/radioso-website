import { SiteFooter } from '@/components/site-footer'
import { PillNav } from '@/components/pill-nav'
import { AskHero } from '@/components/ask-hero'
import { TrustStrip } from '@/components/trust-strip'
import { PlatformDiagram } from '@/components/platform-diagram'
import { ActsSection } from '@/components/acts-section'
import { Quickstart } from '@/components/quickstart'
import { Reveal } from '@/components/reveal'
import { AskProvider } from '@/lib/ask-context'

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
          </div>
          <PillNav />
          <AskHero />
          <TrustStrip />
          <Reveal>
            <PlatformDiagram />
          </Reveal>
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
