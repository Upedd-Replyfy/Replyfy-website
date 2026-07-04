import { createContext, useContext, useEffect, useState } from 'react'

const ShellThemeContext = createContext(null)

export function ShellThemeProvider({ storageKey, children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light') return 'light'
    return 'dark'
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
