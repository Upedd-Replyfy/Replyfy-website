const tones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  violet: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  neutral: 'border-border bg-slate-50 text-slate-600',
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  busy: 'border-amber-200 bg-amber-50 text-amber-700',
  offline: 'border-slate-200 bg-slate-100 text-slate-500',
}

export default function AdminBadge({ children, tone = 'neutral', className = '', dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-tight ${tones[tone] || tones.neutral} ${className}`}
    >
      {dot ? (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === 'success' || tone === 'available'
              ? 'bg-emerald-500'
              : tone === 'warning' || tone === 'busy'
                ? 'bg-amber-500'
                : tone === 'danger'
                  ? 'bg-rose-500'
                  : tone === 'info' || tone === 'violet'
                    ? 'bg-indigo-500'
                    : 'bg-slate-400'
          }`}
        />
      ) : null}
      {children}
    </span>
  )
}
