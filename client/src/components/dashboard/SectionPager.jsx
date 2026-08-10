import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Fixed-page grid navigator — no section scrolling.
 * Buttons on the right move between pages.
 */
export default function SectionPager({
  items,
  pageSize,
  columnsClassName,
  renderItem,
  empty = null,
  ariaLabel = 'Section pages',
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize))

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  const visible = useMemo(() => {
    const start = page * pageSize
    return (items || []).slice(start, start + pageSize)
  }, [items, pageSize, page])

  if (!items?.length) return empty

  const canPrev = page > 0
  const canNext = page < totalPages - 1

  return (
    <div className="flex items-stretch gap-3" aria-label={ariaLabel}>
      <div className={`min-w-0 flex-1 grid gap-3 ${columnsClassName}`}>
        {visible.map((item, index) => renderItem(item, page * pageSize + index))}
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center gap-2 self-center pl-1">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-ink shadow-sm transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[11px] font-semibold tabular-nums text-muted">
          {page + 1}/{totalPages}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-ink text-card shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:border-border disabled:bg-card disabled:text-muted disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
