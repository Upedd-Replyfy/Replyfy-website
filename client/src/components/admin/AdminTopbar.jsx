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
  ChevronDown,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationApi } from '../../services/api'
import { useShellTheme } from '../../context/ShellThemeContext'
import QuickActionsMenu from './QuickActionsMenu'
import AdminAvatar from './ui/AdminAvatar'

const searchRoutes = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Questions', path: '/admin/questions' },
  { label: 'Answers', path: '/admin/answers' },
  { label: 'Mentors', path: '/admin/experts' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Withdrawals', path: '/admin/withdrawals' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Mentor Types', path: '/admin/expert-types' },
  { label: 'Notifications', path: '/admin/notifications' },
  { label: 'Settings', path: '/admin/settings' },
]

export default function AdminTopbar({
  onMenuOpen,
  onSidebarToggle,
  onRegisterExpert,
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useShellTheme()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationApi.getAll({ unreadOnly: 'true', limit: 1 }),
    refetchInterval: 60000,
  })

  const unread = data?.unreadCount || 0

  const results = search.trim()
    ? searchRoutes.filter((r) => r.label.toLowerCase().includes(search.toLowerCase()))
    : []

  const goTo = (path) => {
    navigate(path)
    setSearch('')
    setSearchOpen(false)
    setMobileSearchOpen(false)
  }

  return (
    <header className="admin-topbar sticky top-0 z-30 border-b border-border/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-[64px] sm:gap-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuOpen || onSidebarToggle}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="relative hidden min-w-0 flex-1 md:block md:max-w-lg">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400" />
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
            aria-label="Search admin pages"
            className="admin-search w-full rounded-2xl border border-border bg-[#F8FAFC] py-2.5 pl-10 pr-14 text-sm text-ink placeholder:text-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-sm lg:flex">
            <Command size={10} /> K
          </kbd>
          {searchOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-white py-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              {results.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  onMouseDown={() => goTo(r.path)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 md:hidden"
            aria-label="Search"
          >
            {mobileSearchOpen ? <X size={17} /> : <Search size={17} />}
          </button>

          <QuickActionsMenu onRegisterExpert={onRegisterExpert} />

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] px-1 text-[9px] font-bold text-white shadow-sm">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <div className="admin-profile-chip hidden items-center gap-2.5 rounded-2xl border border-border bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
            <AdminAvatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400">Administrator</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout()
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-3 pb-3 pt-2 md:hidden">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSearchOpen(true)
              }}
              placeholder="Search admin pages..."
              aria-label="Search admin pages"
              className="admin-search w-full rounded-xl border border-border bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-white py-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                {results.map((r) => (
                  <button
                    key={r.path}
                    type="button"
                    onMouseDown={() => goTo(r.path)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
