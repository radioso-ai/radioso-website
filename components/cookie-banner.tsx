'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'

import { Button } from '@/components/ui/button'
import {
  COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  openCookieSettings,
  setCookieConsent,
} from '@/lib/consent'

/**
 * Minimal GDPR consent banner for the one non-essential thing this site does:
 * PostHog analytics. A slim strip pinned to the bottom edge, so it never covers
 * the content it is asking about. Renders only after mount (the choice lives in
 * localStorage, so the server can't know it), and can be re-opened any time
 * via the footer's "Cookie settings" button — consent must be as easy to
 * withdraw as it was to give.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // The choice lives in localStorage, which the server render can't see — the
    // banner must stay hidden through hydration and appear only in this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(getCookieConsent() === 'undecided')
    const reopen = () => setOpen(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  if (!open) return null

  const decide = (consent: 'yes' | 'no') => {
    setCookieConsent(consent)
    if (consent === 'yes') {
      posthog.opt_in_capturing()
      posthog.set_config({ persistence: 'localStorage+cookie' })
    } else {
      posthog.opt_out_capturing()
      posthog.set_config({ persistence: 'memory' })
    }
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="min-w-0 text-xs leading-snug text-muted-foreground sm:text-sm">
          One analytics cookie, EU-hosted, no ads.{' '}
          <Link
            href="/legal/privacy-policy"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
          >
            Privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" className="rounded-full px-4" onClick={() => decide('yes')}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-4 text-muted-foreground"
            onClick={() => decide('no')}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Footer entry point for changing a previous choice (server components can render this). */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  )
}
