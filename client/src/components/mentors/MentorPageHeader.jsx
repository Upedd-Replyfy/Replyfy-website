import { motion } from 'framer-motion'
import { BadgeCheck, Users } from 'lucide-react'

export default function MentorPageHeader({ total = 0, verified = 0, available = 0 }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="max-w-2xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Mentor directory
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Mentors
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Browse verified mentors and connect with experts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
          <Users size={13} />
          {total} Total Mentors
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
          <BadgeCheck size={13} />
          {verified} Verified
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {available} Active today
        </span>
      </div>
    </motion.header>
  )
}
