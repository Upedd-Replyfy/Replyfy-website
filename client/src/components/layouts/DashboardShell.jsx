import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../services/api'
import { Bell, LogOut, Menu } from 'lucide-react'

export function DashboardShell({ title, nav, children, onMenuOpen }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationApi.getAll({ unreadOnly: 'true', limit: 1 }),
    refetchInterval: 60000,
  })

  const unread = data?.unreadCount || 0

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            {onMenuOpen && (
              <button type="button" onClick={onMenuOpen} className="lg:hidden p-2 text-muted">
                <Menu size={20} />
              </button>
            )}
            <Link to="/" className="text-lg font-semibold text-ink">Replyfy</Link>
            {title && <span className="hidden text-sm text-muted sm:inline">/ {title}</span>}
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" className="relative rounded-lg p-2 text-muted hover:bg-surface">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-fg">
                  {unread}
                </span>
              )}
            </button>
            <span className="hidden text-sm text-ink sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
              className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  )
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="luxury-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-light">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  )
}

export function DataTable({ columns, rows, emptyMessage = 'No data found' }) {
  if (!rows?.length) {
    return (
      <div className="luxury-card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className="luxury-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold text-ink">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row._id || i} className="border-b border-border last:border-0 hover:bg-surface/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-muted">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import StatusBadge from '../ui/StatusBadge'

export { StatusBadge }
