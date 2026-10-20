'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'
import { useTheme } from 'next-themes'

import { track } from '@/lib/analytics'
import {
  ANNOUNCEMENT_CAL_LINK,
  ANNOUNCEMENT_CAL_URL,
  ANNOUNCEMENT_HIDDEN_ATTR,
  ANNOUNCEMENT_STORAGE_KEY,
} from '@/lib/announcement'

type CalApi = Awaited<ReturnType<(typeof import('@calcom/embed-react'))['getCalApi']>>

const CAL_NAMESPACE = 'websummit'
/** What `getCalApi` injects. Pinned here so we can watch it arrive. */
const CAL_EMBED_JS = 'https://app.cal.com/embed/embed.js'

let calApi: Promise<CalApi> | undefined

/**
 * Nothing from Cal.com loads until a visitor asks to book: the site's only other
 * third party waits on the cookie strip, and this one should not get in first.
 *
 * `getCalApi` resolves with a command queue the moment it has injected embed.js, so a
 * script that never arrives (a blocker, a dropped connection) would leave the click
 * doing nothing. Waiting for the script itself turns that into a rejection, and the
 * caller opens the booking page instead. Memoised, so a failure sticks and every later
 * click goes straight to the page.
 */
function loadCal(): Promise<CalApi> {
  calApi ??= import('@calcom/embed-react').then(async ({ getCalApi }) => {
    const cal = await getCalApi({ namespace: CAL_NAMESPACE })
    const script = document.querySelector<HTMLScriptElement>(`script[src="${CAL_EMBED_JS}"]`)
    if (script) {
      await new Promise<void>((resolve, reject) => {
        script.addEventListener('load', () => resolve(), { once: true })
        script.addEventListener('error', () => reject(new Error('Cal.com embed failed to load')), {
          once: true,
        })
      })
    }
    return cal
  })
  return calApi
}

function openBookingPage() {
  const tab = window.open(ANNOUNCEMENT_CAL_URL, '_blank')
  if (tab) tab.opener = null
  else window.location.assign(ANNOUNCEMENT_CAL_URL)
}

/**
 * A thin strip above the nav for Web Summit Lisbon. It is in the static HTML, so a
 * first visit sees it from first paint; a visitor who closed it, or comes after the
 * booth day, is hidden before paint by the script in `app/layout.tsx` (see
 * `lib/announcement.ts`). Closing marks `<html>` the same way, which also keeps it
 * closed across client-side navigation, where the nav and this strip remount.
 */
export function AnnouncementStrip() {
  const { resolvedTheme } = useTheme()
  const opening = useRef(false)

  const close = () => {
    try {
      window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, '1')
    } catch {
      // Storage unavailable: closed for this page view only.
    }
    document.documentElement.setAttribute(ANNOUNCEMENT_HIDDEN_ATTR, '')
  }

  // A real link underneath, so no JS, a middle click or cmd-click still reach the
  // booking page. A plain click opens the same page in a Cal.com modal instead.
  const book = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    track('announcement_book_click', { event: 'websummit-2026' })
    if (opening.current) return
    opening.current = true
    try {
      const cal = await loadCal()
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      })
      cal('modal', {
        calLink: ANNOUNCEMENT_CAL_LINK,
        config: {
          layout: 'month_view',
          useSlotsViewOnSmallScreen: 'true',
          // Open on the booth day rather than today.
          month: '2026-11',
          date: '2026-11-09',
        },
      })
    } catch {
      openBookingPage()
    } finally {
      opening.current = false
    }
  }

  return (
    <div className="announcement-strip border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
        {/* Below `md` the copy runs from the page gutter, which is what lets the short
            line fit a 375px phone. From `md` it centres over the pill and takes the
            pill's inset, so the close button's glyph lines up with the pill's edge. */}
        <div className="relative flex min-h-9 w-full items-center py-1.5 pr-7 md:mx-auto md:max-w-[calc(100%-1rem)] md:justify-center md:px-10">
          <p className="min-w-0 text-xs leading-snug text-muted-foreground sm:text-sm">
            {/* "Lisbon" goes on phones: with it the line needs 320px and a 375px
                screen has 315. Web Summit in November is Lisbon. */}
            <span className="sm:hidden">Web Summit, ALPHA booth, 9 Nov.</span>
            <span className="hidden sm:inline">
              Meet us at Web Summit Lisbon, ALPHA booth, Monday 9 November.
            </span>{' '}
            <a
              href={ANNOUNCEMENT_CAL_URL}
              target="_blank"
              rel="noopener"
              onClick={book}
              className="whitespace-nowrap rounded-sm font-medium text-foreground underline underline-offset-2 outline-none transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Book 15 minutes
            </a>
          </p>
          <button
            type="button"
            aria-label="Close the Web Summit announcement"
            onClick={close}
            className="absolute -right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
