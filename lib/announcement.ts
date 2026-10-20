/**
 * The strip above the nav: Web Summit Lisbon 2026, where Radioso has an ALPHA booth
 * on Monday 9 November. Delete this file, `components/announcement-strip.tsx` and
 * the script in `app/layout.tsx` once the event is behind us.
 *
 * Plain module, not `'use client'`: the root layout (a server component) needs the
 * real values to write the pre-paint script, and a client module would hand it
 * references instead.
 */

/** Set on `<html>` when the strip should not show. `globals.css` hides it from that. */
export const ANNOUNCEMENT_HIDDEN_ATTR = 'data-announcement-hidden'

/** Where a visitor's "close" is remembered. */
export const ANNOUNCEMENT_STORAGE_KEY = 'radioso:banner:websummit-2026'

/** The booth day ends at midnight in Lisbon, which is on UTC in November. */
export const ANNOUNCEMENT_ENDS_AT = Date.UTC(2026, 10, 10)

/** The founder's 15-minute "Meet the founder" event on Cal.com. */
export const ANNOUNCEMENT_CAL_LINK = 'dmitri-borohhov-radioso-5tlgwi/secret'
export const ANNOUNCEMENT_CAL_URL = `https://cal.com/${ANNOUNCEMENT_CAL_LINK}`

/**
 * Runs in `<head>` before anything paints, the same trick as the theme script. The
 * static HTML is built weeks before the event and always contains the strip, so the
 * two reasons to hide it, a past close and a past date, have to be read in the
 * browser. Marking `<html>` before first paint means neither visitor sees it flash.
 * The date is checked first, so a browser that blocks storage still loses the strip
 * on time.
 */
export const announcementScript = `try{if(Date.now()>=${ANNOUNCEMENT_ENDS_AT}||localStorage.getItem(${JSON.stringify(
  ANNOUNCEMENT_STORAGE_KEY,
)}))document.documentElement.setAttribute(${JSON.stringify(ANNOUNCEMENT_HIDDEN_ATTR)},'')}catch(e){}`
