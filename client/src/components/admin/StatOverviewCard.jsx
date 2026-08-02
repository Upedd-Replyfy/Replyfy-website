import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

const iconGradients = {
  sky: 'from-[#4F46E5] to-[#6366F1]',
  violet: 'from-[#6366F1] to-[#3B82F6]',
  cyan: 'from-[#3B82F6] to-[#60A5FA]',
  emerald: 'from-[#22C55E] to-[#4ADE80]',
  amber: 'from-[#F59E0B] to-[#FBBF24]',
  rose: 'from-[#EF4444] to-[#F87171]',
  blue: 'from-[#3B82F6] to-[#6366F1]',
  purple: 'from-[#4F46E5] to-[#818CF8]',
}

export default function StatOverviewCard({
  label,
  value,
  trend,
  icon: Icon,
  accent = 'sky',
  loading = false,
}) {
  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus

  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-600 bg-emerald-50'
      : trend?.direction === 'down'
        ? 'text-rose-600 bg-rose-50'
        : 'text-slate-500 bg-slate-50'

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="admin-stat-card group relative overflow-hidden rounded-[18px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-400/10 blur-2xl transition group-hover:bg-indigo-400/20" />
      <div className="relative flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradients[accent] || iconGradients.sky} text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]`}
        >
          {Icon && <Icon size={18} strokeWidth={2.1} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          )}
          {!loading && trend && (
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${trendColor}`}>
              <TrendIcon size={11} />
              {trend.change}%
              <span className="font-medium text-slate-400">vs last</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
