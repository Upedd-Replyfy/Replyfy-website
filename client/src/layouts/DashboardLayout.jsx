import { useState } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-canvas">
      <DashboardSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <DashboardTopbar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-canvas">{children}</main>
      </div>
    </div>
  )
}
