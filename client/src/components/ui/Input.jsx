import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, id, error, className = '', dense = false, ...props },
  ref
) {
  return (
    <div className={dense ? 'space-y-1' : 'space-y-2'}>
      {label && (
        <label
          htmlFor={id}
          className={`block font-medium text-ink ${dense ? 'text-xs' : 'text-sm'}`}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full border bg-card text-sm text-ink shadow-[var(--shadow-luxury-sm)] placeholder:text-muted-light transition-colors focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10 ${
          dense ? 'rounded-xl px-3.5 py-2.5' : 'rounded-2xl px-4 py-3.5'
        } ${error ? 'border-charcoal' : 'border-border'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-charcoal">{error}</p>}
    </div>
  )
})

export default Input
