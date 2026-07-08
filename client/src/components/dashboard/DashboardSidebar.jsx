import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessagesSquare,
  Users,
  Bookmark,
  CreditCard,
  Settings,
  X,
  PanelLeftClose,
  PanelLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { userApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'New Question', icon: MessageSquarePlus, href: '/dashboard', highlight: true, reset: true },
  { label: 'Workspace', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Questions', icon: MessagesSquare, href: '/dashboard/questions' },
  { label: 'Experts', icon: Users, href: '/dashboard/experts' },
  { label: 'Saved Answers', icon: Bookmark, href: '/dashboard/saved' },
  { label: 'Billing', icon: CreditCard, href: '/dashboard/billing' },
]

const bottomItems = [
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

const statusIcon = {
  answered: CheckCircle2,
  in_review: Loader2,
  matched: Loader2,
}

function NavItem({ item, collapsed, onNavigate, onReset }) {
  const Icon = item.icon

  if (item.highlight) {
    return (
      <NavLink
        to={item.href}
        onClick={(e) => {
          if (item.reset) {
            e.preventDefault()
            onReset?.()
          }
          onNavigate?.()
        }}
        title={collapsed ? item.label : undefined}
        className="group mb-4 flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-fg shadow-[var(--shadow-luxury-md)] transition-all hover:opacity-90"
      >
        <Icon size={18} strokeWidth={2} />
        {!collapsed && item.label}
      </NavLink>
    )
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
          collapsed ? 'justify-center' : ''
        } ${isActive ? 'text-ink' : 'text-muted hover:bg-surface hover:text-ink'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <>
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-card shadow-[var(--shadow-luxury-sm)] ring-1 ring-border"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              {!collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </>
          )}
          <Icon size={18} strokeWidth={1.75} className="relative z-10 shrink-0" />
          {!collapsed && <span className="relative z-10">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

function WorkspaceSwitcher({ collapsed }) {
  const { user } = useAuth()
  const name = user?.name || 'Personal'

  return (
    <div className="relative mb-6">
      <div
        className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-[var(--shadow-luxury-sm)] ${
          collapsed ? 'justify-center px-2' : ''
        }`}
        title={collapsed ? name : undefined}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-fg">
          {name.charAt(0)}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="text-[11px] text-muted-light">Personal workspace</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardSidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const navigate = useNavigate()
  const width = collapsed ? 80 : 304

  const { data: questionsData } = useQuery({
    queryKey: ['sidebar-questions'],
    queryFn: () => userApi.getQuestions({ limit: 3 }),
  })

  const sidebarQuestions = (questionsData?.questions || []).map((q) => ({
    id: q._id,
    title: q.title,
    time: formatRelative(q.createdAt),
    status: mapStatus(q.status),
  }))

  const handleNewQuestion = () => {
    navigate('/dashboard', { state: { reset: true } })
    onClose()
  }

  const sidebar = (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="flex h-screen w-full shrink-0 flex-col overflow-hidden border-r border-border bg-card p-4 md:p-5"
    >
      <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <Logo dashboard light={false} />
        ) : (
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary"
            aria-label="Replyfy"
          >
            <img src="/logo-mark.png" alt="" className="h-8 w-8 object-contain" />
          </Link>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <WorkspaceSwitcher collapsed={collapsed} />

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            onNavigate={onClose}
            onReset={handleNewQuestion}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-6 min-h-0 flex-1 overflow-hidden">
          <p className="mb-3 px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-light">
            Recent activity
          </p>
          <div className="space-y-2 overflow-hidden px-1">
            {sidebarQuestions.length > 0 ? (
              sidebarQuestions.map((q) => {
                const StatusIcon = statusIcon[q.status] || MessageSquarePlus
                return (
                  <NavLink
                    key={q.id}
                    to={`/dashboard/questions/${q.id}`}
                    onClick={onClose}
                    className="group block rounded-xl border border-transparent bg-surface p-3 transition-all hover:border-border hover:bg-card hover:shadow-[var(--shadow-luxury-sm)]"
                  >
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-ink">
                      {q.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-light">{q.time}</span>
                      <StatusIcon
                        size={12}
                        className={`text-ink ${q.status === 'in_review' ? 'animate-spin' : ''}`}
                      />
                    </div>
                  </NavLink>
                )
              })
            ) : (
              <p className="px-3.5 text-xs text-muted-light">No questions yet</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-1 border-t border-border pt-4">
        {bottomItems.map((item) => (
          <NavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onClose} />
        ))}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink lg:flex ${
            collapsed ? 'justify-center' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </motion.aside>
  )

  return (
    <>
      <div className="hidden lg:flex lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:shrink-0 lg:self-start">
        {sidebar}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 h-screen w-[304px] lg:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function formatRelative(date) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}

function mapStatus(status) {
  if (status === 'completed') return 'answered'
  if (['in_progress', 'assigned'].includes(status)) return 'matched'
  if (['waiting_admin_review', 'pending_admin_review'].includes(status)) return 'in_review'
  return 'matched'
}
