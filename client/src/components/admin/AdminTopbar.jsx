import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Command,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationApi } from '../../services/api'
import QuickActionsMenu from './QuickActionsMenu'

const searchRoutes = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Questions', path: '/admin/questions' },
  { label: 'Answers', path: '/admin/answers' },
  { label: 'Experts', path: '/admin/experts' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Withdrawals', path: '/admin/withdrawals' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Expert Types', path: '/admin/expert-types' },
  { label: 'Settings', path: '/admin/settings' },
]

export default function AdminTopbar({
  onMenuOpen,
  onSidebarToggle,
  theme,
  onThemeToggle,
  onRegisterExpert,
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationApi.getAll({ unreadOnly: 'true', limit: 1 }),
    refetchInterval: 60000,
  })

  const unread = data?.unreadCount || 0
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const results = search.trim()
    ? searchRoutes.filter((r) => r.label.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090909]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuOpen || onSidebarToggle}
          className="rounded-xl border border-white/[0.08] p-2 text-muted transition-colors hover:bg-white/[0.06] hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            placeholder="Search admin pages..."
            className="admin-search w-full rounded-2xl border border-white/[0.08] bg-[#111111] py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted lg:flex">
            <Command size={10} /> K
          </kbd>
          {searchOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] py-1 shadow-2xl">
              {results.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  onMouseDown={() => {
                    navigate(r.path)
                    setSearch('')
                    setSearchOpen(false)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-white/[0.06]"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <QuickActionsMenu onRegisterExpert={onRegisterExpert} />

          <button
            type="button"
            onClick={onThemeToggle}
            className="rounded-xl border border-white/[0.08] p-2.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="relative rounded-xl border border-white/[0.08] p-2.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-violet-500 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111111] py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-bold text-white">
              {initials || 'A'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-[10px] text-muted">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
            className="rounded-xl border border-white/[0.08] p-2.5 text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
