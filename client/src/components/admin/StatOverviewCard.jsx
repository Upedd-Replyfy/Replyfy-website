import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const iconColors = {
  sky: 'text-sky-400 bg-sky-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  rose: 'text-rose-400 bg-rose-500/10',
  blue: 'text-blue-400 bg-blue-500/10',
  purple: 'text-purple-400 bg-purple-500/10',
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
      ? 'text-emerald-400'
      : trend?.direction === 'down'
        ? 'text-rose-400'
        : 'text-muted'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#111111] px-3 py-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColors[accent]}`}>
        {Icon && <Icon size={15} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-muted">{label}</p>
        {loading ? (
          <div className="mt-1 h-5 w-16 animate-pulse rounded bg-white/[0.06]" />
        ) : (
          <p className="text-base font-semibold leading-tight text-ink">{value}</p>
        )}
      </div>
      {!loading && trend && (
        <span className={`flex shrink-0 items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
          <TrendIcon size={10} />
          {trend.change}%
        </span>
      )}
    </div>
  )
}
