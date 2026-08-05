import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

export function MentorBadge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'border border-border bg-surface text-muted',
    primary: 'border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 text-[#a5a0ff]',
    success: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    soft: 'border border-border bg-card text-ink',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

export function MentorAvatar({ src, name, size = 'lg', online = false, verified = false }) {
  const sizes = {
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  }
  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={name || 'Mentor'}
        className={`${sizes[size]} rounded-[20px] object-cover shadow-[0_8px_24px_rgba(91,76,255,0.18)] ring-4 ring-card`}
      />
      {online && (
        <span
          className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-card"
          aria-label="Online"
        />
      )}
      {verified && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#5B4CFF] text-white shadow-md ring-2 ring-card"
          aria-label="Verified mentor"
        >
          <BadgeCheck size={13} />
        </motion.span>
      )}
    </div>
  )
}

export function MentorStatsCard({ label, value, icon: Icon }) {
  return (
    <div className="premium-surface-inner rounded-2xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-light">
        {Icon ? <Icon size={12} /> : null}
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
