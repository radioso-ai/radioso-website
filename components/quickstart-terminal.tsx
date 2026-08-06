'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// The exact snippet shown in the terminal — kept character-for-character identical to
// the original static text. Everything the animation types or prints is derived from
// this single source so the animated and static versions can never drift apart.
const SNIPPET = `# requires Node 24 + Docker Desktop
./run-dev.sh

# then open
# http://localhost:3000   web app
# http://localhost:8080   API`

// The base layer (and the resting-cursor state) carry one extra newline so the block
// cursor can come to rest on a fresh, empty prompt line without any layout shift.
const FULL = `${SNIPPET}\n`

const TYPE_MS = 28

type Frame = { text: string; delay: number }

// Build the whole session as a list of "show this text after this delay" frames:
//   1. type the comment + `./run-dev.sh` command, character by character
//   2. after a beat, print the output block line-by-line (instantly per line, like stdout)
//   3. drop the cursor onto a final empty prompt line
function buildFrames(): Frame[] {
  const lines = SNIPPET.split('\n')
  const typed = lines.slice(0, 2).join('\n') // comment line + the run command
  const frames: Frame[] = []

  for (let i = 1; i <= typed.length; i++) {
    frames.push({ text: typed.slice(0, i), delay: i === 1 ? 260 : TYPE_MS })
  }

  // End indices into `lines`: first stop reveals the blank separator + `# then open`
  // together, then each localhost line prints on its own.
  for (const [idx, end] of [4, 5, 6].entries()) {
    frames.push({ text: lines.slice(0, end).join('\n'), delay: idx === 0 ? 420 : 190 })
  }

  frames.push({ text: FULL, delay: 380 })
  return frames
}

/**
 * The quickstart terminal card. Renders the full snippet statically for SSR / no-JS /
 * reduced-motion, then — once it scrolls into view — clears and replays it as a live
 * terminal session (typing the command, printing the output, resting the cursor).
 *
 * No layout shift: a base <code> holding the full snippet reserves the card's final
 * size, and the animated text is overlaid in the same CSS grid cell.
 */
export function QuickstartTerminal() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [displayed, setDisplayed] = useState('')
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Reduced motion (and no-JS, which never gets here): leave the static snippet as-is.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    const timers: number[] = []
    const frames = buildFrames()

    // Drive the sequence from chained timers (never setState synchronously in the effect
    // body — that would trip react-hooks/set-state-in-effect).
    const run = (i: number) => {
      if (cancelled || i >= frames.length) return
      const frame = frames[i]
      const id = window.setTimeout(() => {
        if (cancelled) return
        setDisplayed(frame.text)
        run(i + 1)
      }, frame.delay)
      timers.push(id)
    }

    const start = () => {
      if (cancelled) return
      setAnimating(true)
      setDisplayed('')
      run(0)
    }

    // Fire once, when ~40% of the card is visible, then never again.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            start()
            break
          }
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)

    return () => {
      cancelled = true
      observer.disconnect()
      for (const id of timers) clearTimeout(id)
    }
  }, [])

  return (
    <div ref={ref} className="interactive overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">~/radioso</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-foreground">
        <span className="grid">
          {/* Base layer: the full snippet. Reserves the card's final size and is the real,
              crawlable / no-JS / reduced-motion content. Hidden (but still laid out) while
              the overlay plays. */}
          <code className={cn('col-start-1 row-start-1', animating && 'invisible')}>{FULL}</code>
          {/* Overlay: the animated text with a trailing block cursor. Purely decorative. */}
          <code aria-hidden className={cn('col-start-1 row-start-1', !animating && 'invisible')}>
            {displayed}
            <span className="typing-caret" />
          </code>
        </span>
      </pre>
    </div>
  )
}
