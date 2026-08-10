import { motion } from 'framer-motion'
import { Check, Clock, HelpCircle, Loader2, Users, ArrowUpRight, MessageSquare } from 'lucide-react'
import { fadeUp, staggerContainer } from '../../utils/animations'
import SectionPager from './SectionPager'

const statusConfig = {
  answered: { icon: Check, label: 'Answered', color: 'text-emerald-600' },
  in_review: { icon: Loader2, label: 'In review', color: 'text-sky-600' },
  matched: { icon: Users, label: 'Matched', color: 'text-violet-600' },
  draft: { icon: MessageSquare, label: 'Draft', color: 'text-amber-600' },
}

function QuestionCard({ q, index, onSelect }) {
  const status = statusConfig[q.status] || statusConfig.draft
  const StatusIcon = status.icon
  const isAnswered = q.answered || q.status === 'answered'

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      custom={index * 0.04}
      whileHover={{ y: -2 }}
      onClick={() => onSelect?.(q)}
      className="group flex min-h-[10.5rem] flex-col rounded-xl border border-border bg-card p-3 text-left transition hover:border-ink/25 hover:bg-surface/60"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
            isAnswered
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-border bg-surface text-ink'
          }`}
          aria-label={isAnswered ? 'Answered' : 'Pending answer'}
        >
          {isAnswered ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <HelpCircle size={13} />
          )}
        </span>
        <ArrowUpRight
          size={13}
          className="text-muted-light opacity-0 transition-all group-hover:opacity-100"
        />
      </div>

      <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
        {q.title}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
        {q.preview}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {q.categoryLabel && (
          <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
            {q.categoryLabel}
          </span>
        )}
        {q.expertTypeLabel && (
          <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
            {q.expertTypeLabel}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${status.color}`}>
          <StatusIcon size={11} className={q.status === 'in_review' ? 'animate-spin' : ''} />
          {status.label}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-light">
          <Clock size={10} />
          {q.time}
        </span>
      </div>
    </motion.button>
  )
}

export default function RecentQuestions({ questions, onSelect }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={staggerContainer}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
          Recent questions
        </h2>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Your conversation history with mentors
        </p>
      </div>

      <SectionPager
        items={questions}
        pageSize={8}
        columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        ariaLabel="Recent questions pages"
        renderItem={(q, index) => (
          <QuestionCard key={q.id} q={q} index={index} onSelect={onSelect} />
        )}
      />
    </motion.section>
  )
}
