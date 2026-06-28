import { motion } from 'framer-motion'
import { MessageSquare, Clock, CheckCircle2, Loader2, Users, ArrowUpRight } from 'lucide-react'
import { fadeUp, staggerContainer } from '../../utils/animations'

const statusConfig = {
  answered: { icon: CheckCircle2, label: 'Answered', color: 'text-ink' },
  in_review: { icon: Loader2, label: 'In review', color: 'text-muted' },
  matched: { icon: Users, label: 'Matched', color: 'text-muted' },
  draft: { icon: MessageSquare, label: 'Draft', color: 'text-muted-light' },
}

export default function RecentQuestions({ questions, onSelect }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={staggerContainer}
      className="mt-16 pb-12 md:mt-20 md:pb-16"
    >
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Recent questions
        </h2>
        <p className="mt-2 text-sm text-muted md:text-base">
          Your conversation history with experts
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((q, index) => {
          const status = statusConfig[q.status] || statusConfig.draft
          const StatusIcon = status.icon

          return (
            <motion.button
              key={q.id}
              type="button"
              variants={fadeUp}
              custom={index * 0.05}
              whileHover={{ y: -4 }}
              onClick={() => onSelect?.(q)}
              className="luxury-card luxury-card-hover group flex flex-col p-6 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink">
                  <MessageSquare size={18} />
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-muted-light opacity-0 transition-all group-hover:opacity-100"
                />
              </div>

              <p className="mt-4 line-clamp-2 text-sm font-semibold leading-snug text-ink">
                {q.title}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-light">
                {q.preview}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {q.categoryLabel && (
                  <span className="rounded-lg bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">
                    {q.categoryLabel}
                  </span>
                )}
                {q.expertTypeLabel && (
                  <span className="rounded-lg bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">
                    {q.expertTypeLabel}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between pt-5">
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
        })}
      </div>
    </motion.section>
  )
}
