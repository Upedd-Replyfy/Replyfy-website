import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import UserAvatar from '../ui/UserAvatar'

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

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ExpertUserCard({ question, onOpen }) {
  const user = question.user || {}
  const name = user.name || 'User'
  const solved = question.status === 'completed'

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onOpen(question)}
      className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-luxury-sm)] transition-all duration-200 hover:border-sky-500/25 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center gap-3">
        <UserAvatar src={user.avatar} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[15px] font-semibold tracking-tight text-ink">{name}</p>
            <span className="shrink-0 pt-0.5 text-[11px] font-medium text-muted">
              {timeAgo(question.updatedAt || question.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-muted">{user.email || 'No email'}</p>
        </div>
      </div>

      <h3 className="mt-3.5 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-ink">
        {question.title}
      </h3>

      {question.answerPreview ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
          {question.answerPreview}
        </p>
      ) : question.description ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
          {question.description}
        </p>
      ) : (
        <div className="mt-1.5 flex-1" />
      )}

      <div className="mt-auto pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {question.category?.name ? (
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted">
              {question.category.name}
            </span>
          ) : null}
          {question.plan ? (
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold capitalize text-muted">
              {question.plan}
            </span>
          ) : null}
          {question.amount != null ? (
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-ink">
              {formatMoney(question.amount)}
            </span>
          ) : null}
          <StatusBadge status={question.status} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <Calendar size={12} />
            {solved
              ? `Solved ${formatDate(question.updatedAt || question.createdAt)}`
              : question.deadline
                ? `Due ${formatDate(question.deadline)}`
                : 'No deadline'}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sky-600 opacity-0 transition group-hover:opacity-100 dark:text-sky-400">
            Open
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </motion.button>
  )
}
