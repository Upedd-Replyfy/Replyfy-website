import { useState } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import { DashboardThemeProvider, useDashboardTheme } from '../context/DashboardThemeContext'

function DashboardLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme } = useDashboardTheme()

  return (
    <div className="dashboard-shell relative flex min-h-screen bg-canvas" data-theme={theme}>
      <DashboardSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <DashboardTopbar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-canvas">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardThemeProvider>
  )
}
