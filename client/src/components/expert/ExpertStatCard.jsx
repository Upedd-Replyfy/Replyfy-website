const accents = {
  sky: 'border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.05)]',
  violet: 'border-violet-500/20 shadow-[0_0_20px_rgba(167,139,250,0.05)]',
  cyan: 'border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]',
  emerald: 'border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.05)]',
  amber: 'border-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]',
  rose: 'border-rose-500/20 shadow-[0_0_20px_rgba(251,113,133,0.05)]',
  blue: 'border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]',
  purple: 'border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.05)]',
}

const iconColors = {
  sky: 'text-sky-400 bg-sky-500/15',
  violet: 'text-violet-400 bg-violet-500/15',
  cyan: 'text-cyan-400 bg-cyan-500/15',
  emerald: 'text-emerald-400 bg-emerald-500/15',
  amber: 'text-amber-400 bg-amber-500/15',
  rose: 'text-rose-400 bg-rose-500/15',
  blue: 'text-blue-400 bg-blue-500/15',
  purple: 'text-purple-400 bg-purple-500/15',
}

export default function ExpertStatCard({
  label,
  value,
  icon: Icon,
  accent = 'sky',
  loading = false,
  compact = false,
}) {
  if (compact) {
    return (
      <div
        className={`expert-stat-card relative flex flex-col items-start overflow-hidden rounded-xl border border-border bg-card px-2.5 py-2.5 transition-transform hover:-translate-y-0.5 sm:px-3 sm:py-3 ${accents[accent]}`}
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${iconColors[accent]}`}
        >
          {Icon && <Icon size={14} strokeWidth={1.75} />}
        </div>
        <p className="mt-2 w-full text-[10px] font-medium leading-tight text-muted sm:text-[11px]">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-surface" />
        ) : (
          <p className="mt-0.5 w-full text-base font-bold tracking-tight text-ink sm:text-lg">
            {value}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={`expert-stat-card relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-0.5 sm:p-5 ${accents[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${iconColors[accent]}`}
        >
          {Icon && <Icon size={20} strokeWidth={1.75} className="sm:hidden" />}
          {Icon && <Icon size={22} strokeWidth={1.75} className="hidden sm:block" />}
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-muted sm:mt-4 sm:text-sm">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-7 w-20 animate-pulse rounded-lg bg-surface sm:mt-2 sm:h-8 sm:w-28" />
      ) : (
        <p className="mt-0.5 text-xl font-bold tracking-tight text-ink sm:mt-1 sm:text-2xl">{value}</p>
      )}
    </div>
  )
}
