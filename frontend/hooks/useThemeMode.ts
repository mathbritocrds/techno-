import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'app-theme-preference'

function getStoredPreference(): 'light' | 'dark' | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * User-controlled light/dark override, layered on top of the platform's own
 * system-preference detection (see darkMode.ts). Persists the explicit choice so it
 * survives reloads, and applies it once on mount (after darkMode.ts has already run).
 */
export function useThemeMode(): { theme: 'light' | 'dark'; toggleTheme: () => void } {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredPreference()
    if (stored) return stored
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    const stored = getStoredPreference()
    if (stored) applyTheme(stored)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore storage errors (e.g. private browsing)
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
