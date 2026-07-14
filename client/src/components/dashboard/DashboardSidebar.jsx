import { NavLink, useNavigate } from 'react-router-dom'
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
  Briefcase,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { userApi } from '../../services/api'

const navItems = [
  { label: 'New Question', icon: MessageSquarePlus, href: '/dashboard', highlight: true, reset: true },
  { label: 'Workspace', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Questions', icon: MessagesSquare, href: '/dashboard/questions' },
  { label: 'Mentors', icon: Users, href: '/dashboard/experts' },
  { label: 'Saved Answers', icon: Bookmark, href: '/dashboard/saved' },
  { label: 'Billing', icon: CreditCard, href: '/dashboard/billing' },
]

const bottomItems = [
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

const statusDotClass = {
  answered: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]',
  in_review: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]',
  matched: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]',
  pending: 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
}

const statusLabel = {
  answered: 'Answered',
  in_review: 'In review',
  matched: 'In progress',
  pending: 'Pending',
}

function NavItem({ item, onNavigate, onReset }) {
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
        className="mb-5 flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-fg shadow-[var(--shadow-luxury-md)] transition hover:opacity-90 active:scale-[0.99]"
      >
        <Icon size={18} strokeWidth={2} />
        {item.label}
      </NavLink>
    )
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'text-ink' : 'text-muted hover:bg-surface hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <>
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-surface ring-1 ring-border"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            </>
          )}
          <Icon size={18} strokeWidth={1.75} className="relative z-10 shrink-0 opacity-90" />
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function WorkspaceBadge() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted">
        <Briefcase size={16} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Personal workspace</p>
        <p className="text-[11px] text-muted-light">Ask mentors privately</p>
      </div>
    </div>
  )
}

export default function DashboardSidebar({ open, onClose }) {
  const navigate = useNavigate()

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
    <aside className="flex h-screen w-full shrink-0 flex-col overflow-hidden border-r border-border bg-card px-4 py-5 md:px-5">
      <div className="mb-6 flex items-center justify-between">
        <Logo dashboard surface="adaptive" size="md" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <WorkspaceBadge />

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            onNavigate={onClose}
            onReset={handleNewQuestion}
          />
        ))}
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-hidden">
        <p className="mb-3 px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-light">
          Recent activity
        </p>
        <div className="space-y-2 overflow-y-auto px-1">
          {sidebarQuestions.length > 0 ? (
            sidebarQuestions.map((q) => (
              <NavLink
                key={q.id}
                to={`/dashboard/questions/${q.id}`}
                onClick={onClose}
                className="group block rounded-xl border border-transparent bg-surface/80 p-3 transition hover:border-border hover:bg-card"
              >
                <p className="line-clamp-2 text-xs font-medium leading-snug text-ink">{q.title}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-light">{q.time}</span>
                  <span
                    className="inline-flex items-center gap-1.5"
                    title={statusLabel[q.status] || 'Pending'}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass[q.status] || statusDotClass.pending}`}
                    />
                  </span>
                </div>
              </NavLink>
            ))
          ) : (
            <p className="px-3.5 text-xs text-muted-light">No questions yet</p>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        {bottomItems.map((item) => (
          <NavItem key={item.label} item={item} onNavigate={onClose} />
        ))}
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden w-[304px] shrink-0 lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-screen lg:self-start">
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
  if (['waiting_admin_review', 'pending_admin_review'].includes(status)) return 'in_review'
  if (['in_progress', 'assigned'].includes(status)) return 'matched'
  return 'pending'
}
