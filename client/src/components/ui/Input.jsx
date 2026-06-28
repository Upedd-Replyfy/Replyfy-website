import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, id, error, className = '', ...props },
  ref
) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full rounded-2xl border bg-card px-4 py-3.5 text-sm text-ink shadow-[var(--shadow-luxury-sm)] placeholder:text-muted-light transition-colors focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10 ${
          error ? 'border-charcoal' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-charcoal">{error}</p>}
    </div>
  )
})

export default Input
