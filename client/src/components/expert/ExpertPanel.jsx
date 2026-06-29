export default function ExpertPanel({ title, subtitle, action, children, className = '', noPadding = false }) {
  const hasHeader = title || action

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : hasHeader ? 'px-6 py-5' : 'p-6'}>{children}</div>
    </div>
  )
}
