import { SiteFooter } from '@/components/site-footer'
import { PillNav } from '@/components/pill-nav'
import { AskHero } from '@/components/ask-hero'
import { AudienceSection } from '@/components/audience-section'
import { PlatformOverview } from '@/components/platform-diagram'
import { LicensingSection } from '@/components/licensing-section'
import { FaqSection } from '@/components/faq-section'
import { ClosingCta } from '@/components/closing-cta'
import { AgentDemos } from '@/components/agent-demos'
import { Reveal } from '@/components/reveal'
import { JsonLd } from '@/components/json-ld'
import { AskProvider } from '@/lib/ask-context'
import { homepageGraph } from '@/lib/structured-data'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={homepageGraph()} />
      <AskProvider>
        <main className="relative flex-1">
          <PillNav />
          <AskHero />
          {/* Manages its own tabs and scroll-triggered scenes — deliberately not
              wrapped in a page-level Reveal. */}
          <AgentDemos />
          <Reveal>
            <AudienceSection />
          </Reveal>
          {/* Keep the homepage proof compact; the full architecture, interfaces,
              providers, and local quickstart live on /developers. */}
          <Reveal>
            <PlatformOverview />
          </Reveal>
          <Reveal>
            <LicensingSection />
          </Reveal>
          <Reveal>
            <FaqSection />
          </Reveal>
          <Reveal>
            <ClosingCta />
          </Reveal>
        </main>
      </AskProvider>
      <SiteFooter />
    </div>
  )
}
