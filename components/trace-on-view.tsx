'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Arms the one-shot "live trace" animations in its subtree by flipping
 * `data-trace` to `run` the first time it scrolls into view. Pure
 * IntersectionObserver, fires once, never while off-screen.
 *
 * The trace itself is entirely CSS (see the trace block in globals.css). Every
 * animated element is decorative and additive: it rests at opacity 0 and decays
 * back there, so the diagram's resting state IS its finished state. If this
 * component never runs — no JS, prefers-reduced-motion, static HTML — the
 * diagram still reads complete and nothing is hidden.
 *
 * `delay` holds the trace back a beat so it starts after the surrounding
 * <Reveal> has settled rather than fighting it.
 *
 * `arm` is for the other shape of one-shot effect, the one the refund scene
 * uses: an animation whose resting state is its *finished* state, which
 * therefore has to be wound back before it can play. It sets `data-armed`
 * before the first paint after hydration — while the subtree is still below the
 * fold — and declines to do so under `prefers-reduced-motion`. Style the wound
 * back state under `[data-armed]` and the playback under
 * `[data-armed][data-trace='run']`, so the served HTML, a visitor without JS
 * and a reduced-motion visitor all get the finished state and nothing is ever
 * left half-played.
 */
export function TraceOnView({
  children,
  className,
  delay = 0,
  id,
  arm = false,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
  arm?: boolean
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [running, setRunning] = useState(false)

  // Set imperatively rather than through state: winding the subtree back is a
  // presentation detail, and there is nothing here worth a re-render.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current
    if (!arm || !node) return
    if (window.matchMedia(MOTION_QUERY).matches) return
    node.dataset.armed = 'true'
  }, [arm])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let timer = 0
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.disconnect()
          timer = window.setTimeout(() => setRunning(true), delay)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.28 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [delay])

  return (
    <Tag ref={ref} id={id} className={cn(className)} data-trace={running ? 'run' : 'idle'}>
      {children}
    </Tag>
  )
}
