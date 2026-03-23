import { useEffect, useMemo, useState } from 'react'

export const THEME_STORAGE_KEY = 'virtualxi-theme'

export type Theme = 'light' | 'dark'

function readInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  const prefersDark =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false)
  return prefersDark ? 'dark' : 'light'
}

type ThemeToggleProps = {
  /** Class for the button — use `nav-theme` on landing, `dash-navbar-theme` on dashboard. */
  buttonClassName?: string
}

export default function ThemeToggle({ buttonClassName = 'nav-theme' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = theme
  }, [theme])

  const icon = useMemo(() => {
    if (theme === 'dark') {
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )
    }

    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }, [theme])

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle dark mode"
      title="Toggle theme"
    >
      {icon}
    </button>
  )
}
