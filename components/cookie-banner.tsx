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
 * PostHog analytics. Renders only after mount (the choice lives in
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
      className="fixed inset-x-4 bottom-4 z-[60] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-sm"
    >
      <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-xl shadow-primary/10 backdrop-blur-md">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          We use one analytics cookie (PostHog, EU-hosted) to understand how this site is used — no
          ads, no cross-site tracking. Decline and we won&apos;t track you at all. See our{' '}
          <Link
            href="/legal/privacy-policy"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
          >
            privacy policy
          </Link>
          .
        </p>
        <div className="mt-3 flex items-center gap-2">
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
