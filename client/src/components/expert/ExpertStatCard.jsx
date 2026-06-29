const accents = {
  sky: 'border-sky-500/20 shadow-[0_0_32px_rgba(56,189,248,0.06)]',
  violet: 'border-violet-500/20 shadow-[0_0_32px_rgba(167,139,250,0.06)]',
  cyan: 'border-cyan-500/20 shadow-[0_0_32px_rgba(34,211,238,0.06)]',
  emerald: 'border-emerald-500/20 shadow-[0_0_32px_rgba(52,211,153,0.06)]',
  amber: 'border-amber-500/20 shadow-[0_0_32px_rgba(251,191,36,0.06)]',
  rose: 'border-rose-500/20 shadow-[0_0_32px_rgba(251,113,133,0.06)]',
  blue: 'border-blue-500/20 shadow-[0_0_32px_rgba(59,130,246,0.06)]',
  purple: 'border-purple-500/20 shadow-[0_0_32px_rgba(168,85,247,0.06)]',
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
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-[#111111] p-5 transition-transform hover:-translate-y-0.5 ${accents[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColors[accent]}`}>
          {Icon && <Icon size={22} strokeWidth={1.75} />}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
      ) : (
        <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
      )}
    </div>
  )
}
