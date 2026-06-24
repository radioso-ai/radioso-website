'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

/**
 * Minimal theme toggle. The site follows the system (daylight) theme by default;
 * this lets a visitor override it. Which icon/label shows is driven purely by the
 * `.dark` class via CSS (`dark:` variants), so there's no hydration flash — and the
 * click reads the real applied theme from the DOM, independent of React timing.
 */
export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string
  showLabel?: boolean
}) {
  const { setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle light or dark theme"
      onClick={() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'light' : 'dark')
      }}
      className={className}
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
      {showLabel && (
        <>
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:block">Light mode</span>
        </>
      )}
    </button>
  )
}
