import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ExpertSidebar from '../components/expert/ExpertSidebar'
import ExpertTopbar from '../components/expert/ExpertTopbar'
import { ShellThemeProvider, useShellTheme } from '../context/ShellThemeContext'

function ExpertLayoutInner() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme } = useShellTheme()

  return (
    <div className="expert-shell min-h-screen bg-canvas text-ink" data-theme={theme}>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <ExpertSidebar />
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <ExpertSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="lg:pl-[248px]">
        <ExpertTopbar onMenuOpen={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl bg-canvas p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function ExpertLayout() {
  return (
    <ShellThemeProvider storageKey="expert-theme">
      <ExpertLayoutInner />
    </ShellThemeProvider>
  )
}
