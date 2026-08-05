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
  Sparkles,
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
  answered: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]',
  in_review: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]',
  matched: 'bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]',
  pending: 'bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]',
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
        className="group relative mb-5 flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B4CFF] to-[#7C6CFF] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(91,76,255,0.35)] transition hover:shadow-[0_14px_34px_rgba(91,76,255,0.45)] active:scale-[0.99]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.22)_50%,transparent_70%)] opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100"
        />
        <Icon size={18} strokeWidth={2.25} className="relative z-10" />
        <span className="relative z-10">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${
          isActive ? 'text-ink' : 'text-muted hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5B4CFF]/14 via-[#7C6CFF]/08 to-transparent shadow-[inset_0_0_0_1px_rgba(91,76,255,0.22)]"
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            />
          )}
          <span
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
              isActive
                ? 'bg-gradient-to-br from-[#5B4CFF] to-[#7C6CFF] text-white shadow-[0_8px_16px_rgba(91,76,255,0.3)]'
                : 'bg-surface text-muted ring-1 ring-border group-hover:bg-card group-hover:text-[#5B4CFF] group-hover:shadow-sm'
            }`}
          >
            <Icon size={15} strokeWidth={isActive ? 2.25 : 1.85} />
          </span>
          <span className="relative z-10 tracking-tight">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function WorkspaceBadge() {
  return (
    <div className="premium-surface relative mb-5 overflow-hidden rounded-2xl px-3.5 py-3.5">
      <div className="relative z-10 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B4CFF] to-[#7C6CFF] text-white shadow-[0_8px_18px_rgba(91,76,255,0.35)]">
          <Briefcase size={16} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-ink">Personal workspace</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
            <Sparkles size={10} className="text-[#7C6CFF]" />
            Ask mentors privately
          </p>
        </div>
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
    <aside className="relative flex h-screen w-full shrink-0 flex-col overflow-hidden border-r border-border bg-card/95 px-4 py-5 backdrop-blur-xl md:px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top_left,rgba(91,76,255,0.12),transparent_60%)]"
      />

      <div className="relative z-10 mb-5 flex items-center justify-between">
        <Logo dashboard surface="adaptive" size="md" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border bg-surface/80 p-1.5 text-muted transition hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <WorkspaceBadge />

        <nav className="flex flex-col gap-1">
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
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-light">
              Recent activity
            </p>
            {sidebarQuestions.length > 0 ? (
              <NavLink
                to="/dashboard/questions"
                onClick={onClose}
                className="text-[10px] font-semibold text-[#5B4CFF] transition hover:text-[#7C6CFF]"
              >
                View all
              </NavLink>
            ) : null}
          </div>
          <div className="space-y-2 overflow-y-auto overscroll-contain px-0.5 pb-2">
            {sidebarQuestions.length > 0 ? (
              sidebarQuestions.map((q) => (
                <NavLink
                  key={q.id}
                  to={`/dashboard/questions/${q.id}`}
                  onClick={onClose}
                  className="premium-surface-inner group relative block overflow-hidden rounded-xl p-3 transition hover:border-[#5B4CFF]/40"
                >
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-ink transition group-hover:text-[#5B4CFF]">
                    {q.title}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-light">{q.time}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-medium text-muted"
                      title={statusLabel[q.status] || 'Pending'}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass[q.status] || statusDotClass.pending}`}
                      />
                      {statusLabel[q.status] || 'Pending'}
                    </span>
                  </div>
                </NavLink>
              ))
            ) : (
              <div className="premium-surface-inner rounded-xl px-3.5 py-4 text-center">
                <p className="text-xs text-muted-light">No questions yet</p>
                <p className="mt-1 text-[10px] text-muted-light/80">Start with a new question</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto border-t border-border/80 pt-3">
          {bottomItems.map((item) => (
            <NavItem key={item.label} item={item} onNavigate={onClose} />
          ))}
        </div>
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
