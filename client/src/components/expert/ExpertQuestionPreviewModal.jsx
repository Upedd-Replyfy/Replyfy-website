import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Calendar, FolderOpen, CreditCard, ArrowRight, BadgeCheck } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'

function formatMoney(amount) {
  return `₹${(amount || 0) / 100}`
}

function initials(name = '?') {
  return String(name)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="max-w-[65%] text-right text-xs font-semibold text-ink">{value ?? '—'}</dd>
    </div>
  )
}

export default function ExpertQuestionPreviewModal({ open, question, onClose }) {
  if (!question) return null

  const user = question.user || {}
  const name = user.name || 'User'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="User question card"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:rounded-3xl"
          >
            {/* User header card */}
            <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-sky-500/10 via-violet-500/5 to-transparent px-5 pb-5 pt-4">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-card/80 p-1.5 text-muted backdrop-blur transition hover:bg-surface hover:text-ink"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-16 w-16 rounded-2xl object-cover shadow-md ring-2 ring-white"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-lg font-bold text-white shadow-md ring-2 ring-white">
                    {initials(name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate text-xl font-bold tracking-tight text-ink">{name}</h2>
                    <BadgeCheck size={16} className="shrink-0 text-sky-500" />
                  </div>
                  {user.email && (
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                      <Mail size={13} />
                      {user.email}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={question.status} />
                    {question.category?.name && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-2.5 py-0.5 text-[11px] font-semibold text-muted backdrop-blur">
                        <FolderOpen size={11} />
                        {question.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto p-5">
              <section className="rounded-2xl border border-border bg-surface/50 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Question details
                </h3>
                <p className="mt-2 text-sm font-bold text-ink">{question.title}</p>
                <div className="mt-2.5 max-h-44 overflow-y-auto rounded-xl border border-border bg-card p-3.5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                    {question.description || 'No description provided.'}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface/50 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Plan details
                </h3>
                <dl className="mt-1 divide-y divide-border">
                  <InfoRow
                    label="Plan"
                    value={<span className="capitalize">{question.plan || '—'}</span>}
                  />
                  <InfoRow label="Price" value={formatMoney(question.amount)} />
                  <InfoRow
                    label="Priority"
                    value={<span className="capitalize">{question.priority || 'standard'}</span>}
                  />
                  <InfoRow
                    label="Due date"
                    value={
                      question.deadline
                        ? new Date(question.deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'
                    }
                  />
                  <InfoRow
                    label="Created"
                    value={
                      question.createdAt
                        ? new Date(question.createdAt).toLocaleString('en-IN')
                        : '—'
                    }
                  />
                </dl>
              </section>
            </div>

            <div className="border-t border-border bg-card p-4">
              <Link
                to={`/expert/questions/${question._id}`}
                onClick={onClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(14,165,233,0.25)] transition hover:opacity-95"
              >
                Open full question & answer
                <ArrowRight size={16} />
              </Link>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-muted">
                <Calendar size={11} />
                {question.deadline
                  ? `Due ${new Date(question.deadline).toLocaleDateString('en-IN')}`
                  : 'No deadline set'}
                <span className="mx-1 text-border">·</span>
                <CreditCard size={11} />
                {formatMoney(question.amount)}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
