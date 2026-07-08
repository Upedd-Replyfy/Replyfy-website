import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  Plus,
  MessageSquarePlus,
  User,
  Settings,
  LogOut,
  CreditCard,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDashboardTheme } from '../../context/DashboardThemeContext'
import { notificationApi } from '../../services/api'
import { formatDistanceToNow } from '../../utils/date'

export default function DashboardTopbar({ onMenuOpen }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useDashboardTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const quickRef = useRef(null)

  const { data: notificationsData } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => notificationApi.getAll({ limit: 10 }),
    refetchInterval: 60000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] }),
  })

  const notifications = notificationsData?.notifications || []
  const unreadCount = notificationsData?.unreadCount || 0

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (quickRef.current && !quickRef.current.contains(e.target)) setQuickOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigate(`/dashboard/experts?search=${encodeURIComponent(query)}`)
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id)
    }
    setNotifOpen(false)
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const avatarSrc =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=111&color=fff`

  const profileMenu = [
    { icon: User, label: 'Profile', action: () => navigate('/dashboard/settings') },
    { icon: CreditCard, label: 'Billing', action: () => navigate('/dashboard/billing') },
    { icon: Settings, label: 'Settings', action: () => navigate('/dashboard/settings') },
    { icon: LogOut, label: 'Sign out', action: handleSignOut },
  ]

  return (
    <header className="sticky top-0 z-40 flex w-full items-center gap-3 overflow-visible border-b border-border bg-card/90 px-5 py-3 backdrop-blur-xl md:px-8 md:py-3.5">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-xl p-2 text-muted transition-colors hover:bg-surface hover:text-ink lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearch} className="relative min-w-0 flex-1 max-w-2xl">
        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <Sparkles size={15} className="text-muted-light" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask or search anything — questions, experts, answers..."
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-20 text-sm text-ink shadow-[var(--shadow-luxury-sm)] placeholder:text-muted-light transition-all focus:border-charcoal focus:bg-card focus:outline-none focus:ring-2 focus:ring-charcoal/10"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 sm:flex">
          <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-light">
            Enter
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
        <div className="relative" ref={quickRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuickOpen(!quickOpen)}
            className="btn-primary hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold sm:flex"
          >
            <Plus size={16} />
            Quick action
          </motion.button>
          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-luxury-lg)]"
              >
                {[
                  { icon: MessageSquarePlus, label: 'New question', action: () => navigate('/dashboard', { state: { reset: true } }) },
                  { icon: Search, label: 'Find expert', action: () => navigate('/dashboard/experts') },
                  { icon: Sparkles, label: 'Go to workspace', action: () => navigate('/dashboard') },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      action.action?.()
                      setQuickOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                  >
                    <action.icon size={16} className="text-muted" />
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="rounded-xl border border-border p-2.5 text-muted transition-colors hover:bg-surface hover:text-ink"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        <div className="relative" ref={notifRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2.5 text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-fg ring-2 ring-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxury-lg)]"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-ink">Notifications</p>
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-xs text-muted-light">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface ${
                          !n.isRead ? 'bg-surface' : ''
                        }`}
                      >
                        <p className="text-xs font-medium text-ink">{n.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{n.message}</p>
                        <p className="mt-1 text-[10px] text-muted-light">{formatDistanceToNow(n.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0" ref={profileRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-[var(--shadow-luxury-sm)] transition-colors hover:bg-surface"
          >
            <img src={avatarSrc} alt="" className="h-8 w-8 rounded-lg object-cover" />
            <span className="hidden text-sm font-medium text-ink sm:inline">
              {user?.name?.split(' ')[0] || 'Account'}
            </span>
            <ChevronDown size={14} className="hidden text-muted sm:inline" />
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-luxury-lg)]"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-muted-light">{user?.email}</p>
                </div>
                {profileMenu.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.action()
                      if (item.label !== 'Sign out') setProfileOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                  >
                    <item.icon size={16} className="text-muted" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
