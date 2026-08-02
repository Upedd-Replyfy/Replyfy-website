import { motion } from 'framer-motion'
import { Calendar, ArrowUpRight } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'

function initials(name = '?') {
  return String(name)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function formatMoney(amount) {
  return `₹${(amount || 0) / 100}`
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * Professional user/request card for mentor assignment lists.
 * Click opens preview popup (handled by parent).
 */
export default function ExpertUserCard({ question, onOpen }) {
  const user = question.user || {}
  const name = user.name || 'User'

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(question)}
      className="group relative flex w-full flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-luxury-sm)] transition-all duration-200 hover:border-sky-500/30 hover:shadow-[0_12px_32px_rgba(14,165,233,0.1)]"
    >
      <div className="flex items-start gap-3.5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-white/80 shadow-sm"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-sm font-bold text-white shadow-sm ring-2 ring-white/80">
            {initials(name)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-ink">{name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{user.email || 'No email'}</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-muted">{timeAgo(question.createdAt)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-snug text-ink/90">
        {question.title}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {question.category?.name && (
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
            {question.category.name}
          </span>
        )}
        {question.plan && (
          <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold capitalize text-muted">
            {question.plan}
          </span>
        )}
        {question.amount != null && (
          <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-bold text-ink">
            {formatMoney(question.amount)}
          </span>
        )}
        <StatusBadge status={question.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
          <Calendar size={12} />
          {question.deadline
            ? `Due ${new Date(question.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`
            : 'No deadline'}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 opacity-0 transition group-hover:opacity-100 dark:text-sky-400">
          View card
          <ArrowUpRight size={12} />
        </span>
      </div>
    </motion.button>
  )
}
