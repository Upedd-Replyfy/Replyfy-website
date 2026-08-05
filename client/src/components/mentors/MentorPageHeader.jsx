import { motion } from 'framer-motion'
import { BadgeCheck, Sparkles, Users } from 'lucide-react'

export default function MentorPageHeader({ total = 0, verified = 0, available = 0 }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a5a0ff]">
          <Sparkles size={12} />
          Mentor directory
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-[36px] sm:leading-[1.15]">
          Mentors
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Browse verified mentors and connect with experts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
          <Users size={13} className="text-[#7C6CFF]" />
          {total} Total Mentors
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-xs font-semibold text-[#a5a0ff]">
          <BadgeCheck size={13} />
          {verified} Verified
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {available} Active today
        </span>
      </div>
    </motion.header>
  )
}
