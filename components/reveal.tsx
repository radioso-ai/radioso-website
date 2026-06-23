'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Reveals its children with a rise-and-fade as they scroll into view, once.
 * Pure IntersectionObserver — no animation library. Honors prefers-reduced-motion
 * via the `.reveal` styles in globals.css (which collapse to a no-op there).
 *
 * `delay` staggers siblings (e.g. cards in a grid); `as` lets a section keep its tag.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // If it's already on screen at mount (above the fold), reveal without waiting.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={cn('reveal', visible && 'is-visible', className)}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
