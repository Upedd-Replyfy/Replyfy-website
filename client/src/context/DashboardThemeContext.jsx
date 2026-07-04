import { ShellThemeProvider, useShellTheme } from './ShellThemeContext'

const STORAGE_KEY = 'dashboard-theme'

export function DashboardThemeProvider({ children }) {
  return <ShellThemeProvider storageKey={STORAGE_KEY}>{children}</ShellThemeProvider>
}

export function useDashboardTheme() {
  return useShellTheme()
}
