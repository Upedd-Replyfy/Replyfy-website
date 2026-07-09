import { motion } from 'framer-motion'
import { Skeleton } from '../ui/Skeleton'

export function CategoryPills({ categories, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="mb-2 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    )
  }

  if (!categories.length) {
    return (
      <p className="mb-4 text-sm text-muted">No categories available.</p>
    )
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {categories.map((cat) => {
        const active = selectedId === cat._id
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => onSelect(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              active
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'border border-border bg-card text-ink hover:border-charcoal/30'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

export function ExpertTypeTabs({ expertTypes, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="mb-2 flex flex-wrap gap-2 border-b border-border pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-2">
      <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
        Expert
      </span>
      {expertTypes.length === 0 ? (
        <span className="text-sm text-muted">No expert types for this category</span>
      ) : (
        expertTypes.map((type) => {
          const active = selectedId === type._id
          return (
            <button
              key={type._id}
              type="button"
              onClick={() => onSelect(type)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-surface text-ink underline decoration-charcoal/50 decoration-2 underline-offset-4 dark:decoration-white/70'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {type.name}
            </button>
          )
        })
      )}
    </div>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="luxury-card py-16 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="luxury-card py-12 text-center">
      <p className="text-sm text-charcoal">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-4 rounded-xl px-4 py-2 text-sm">
          Retry
        </button>
      )}
    </div>
  )
}
