import posthog from 'posthog-js'

/**
 * Product events for the homepage funnel. A thin wrapper so call sites don't each
 * have to know about consent or init order.
 *
 * Consent is PostHog's own job here, same as the pageview capture in
 * `components/posthog-provider.tsx`: a visitor who declined is opted out at init (or
 * by the banner), and `capture` is then a no-op inside the library. Undecided visitors
 * are captured with in-memory persistence only. The `__loaded` guard covers the window
 * before the provider's init effect has run, when `capture` would only log a warning.
 */
export function track(event: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !posthog.__loaded) return
  try {
    posthog.capture(event, properties)
  } catch {
    // Analytics must never break the page.
  }
}
