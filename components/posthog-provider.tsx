'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

import { getCookieConsent } from '@/lib/consent'

const posthogKey = 'phc_wfY6q2d8RNBoCGPz5wbJyfHYiwS3uEWMrbPxTotjKwQs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const consent = getCookieConsent()
    posthog.init(posthogKey, {
      api_host: 'https://eu.i.posthog.com',
      defaults: '2026-05-30',
      person_profiles: 'always',
      // Pageviews are captured manually below so SPA navigations are tracked.
      capture_pageview: false,
      // GDPR/ePrivacy: no device identifiers before consent. Until the visitor
      // accepts, persistence stays in memory (no cookies written); a "no" stops
      // capture entirely. The cookie banner flips both at runtime on accept.
      persistence: consent === 'yes' ? 'localStorage+cookie' : 'memory',
      opt_out_capturing_by_default: consent === 'no',
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

// Captures a $pageview on initial load and on every client-side route change.
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    let url = window.origin + pathname
    const search = searchParams.toString()
    if (search) url += `?${search}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}
