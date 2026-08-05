import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'admin-btn-gradient text-white shadow-[0_8px_20px_rgba(91,76,255,0.25)] hover:shadow-[0_10px_28px_rgba(91,76,255,0.35)]',
  secondary:
    'border border-border bg-card text-ink shadow-sm hover:bg-surface hover:border-[#5B4CFF]/30',
  ghost: 'text-muted hover:bg-surface hover:text-ink',
  success:
    'border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15',
  danger: 'border border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15',
  soft: 'border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 text-[#a5a0ff] hover:bg-[#5B4CFF]/15',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
}

const AdminButton = forwardRef(function AdminButton(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled,
    type = 'button',
    icon: Icon,
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={disabled || loading ? undefined : { scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </motion.button>
  )
})

export default AdminButton
