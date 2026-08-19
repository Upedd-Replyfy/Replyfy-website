export default function ExpertPanel({ title, subtitle, action, children, className = '', noPadding = false }) {
  const hasHeader = title || action

  return (
    <div className={`expert-panel overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : hasHeader ? 'px-4 py-4 sm:px-5 sm:py-4' : 'p-5'}>{children}</div>
    </div>
  )
}
