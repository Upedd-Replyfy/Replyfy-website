const tones = {
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  danger: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
  violet: 'border-[#5B4CFF]/25 bg-[#5B4CFF]/10 text-[#a5a0ff]',
  neutral: 'border-border bg-surface text-muted',
  available: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  busy: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  offline: 'border-border bg-surface text-muted',
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
              ? 'bg-emerald-400'
              : tone === 'warning' || tone === 'busy'
                ? 'bg-amber-400'
                : tone === 'danger'
                  ? 'bg-rose-400'
                  : tone === 'info' || tone === 'violet'
                    ? 'bg-[#7C6CFF]'
                    : 'bg-muted-light'
          }`}
        />
      ) : null}
      {children}
    </span>
  )
}
