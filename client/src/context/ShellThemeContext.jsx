import { createContext, useContext, useEffect, useState } from 'react'

const ShellThemeContext = createContext(null)

export function ShellThemeProvider({ storageKey, children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
    return defaultTheme
  })

  useEffect(() => {
    localStorage.setItem(storageKey, theme)
  }, [storageKey, theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  const isDark = theme === 'dark'

  return (
    <ShellThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, storageKey }}>
      {children}
    </ShellThemeContext.Provider>
  )
}

export function useShellTheme() {
  const context = useContext(ShellThemeContext)
  if (!context) {
    throw new Error('useShellTheme must be used within ShellThemeProvider')
  }
  return context
}
