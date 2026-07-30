/**
 * Analytics cookie consent, shared between the PostHog init and the banner.
 *
 * The choice itself lives in localStorage (storing a consent decision is a
 * strictly-necessary use, exempt from consent). Until the visitor accepts,
 * PostHog runs with in-memory persistence — no cookies or localStorage
 * identifiers touch the device; a decline turns capture off entirely.
 */

export type CookieConsent = 'yes' | 'no' | 'undecided'

const CONSENT_KEY = 'radioso_cookie_consent'

/** The footer's "Cookie settings" button re-opens the banner via this event. */
export const COOKIE_SETTINGS_EVENT = 'radioso:cookie-settings'

export function getCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') return 'undecided'
  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    return value === 'yes' || value === 'no' ? value : 'undecided'
  } catch {
    return 'undecided'
  }
}

export function setCookieConsent(value: 'yes' | 'no') {
  try {
    window.localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // Storage unavailable (private mode): the banner will just re-appear.
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
}
