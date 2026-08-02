import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`admin-panel relative flex max-h-[min(92dvh,920px)] w-full flex-col overflow-hidden rounded-t-[20px] border border-border bg-card shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-h-[90vh] sm:rounded-[20px] ${sizes[size]}`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
                {description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
              {children}
            </div>
            {footer && (
              <div className="shrink-0 border-t border-border bg-white px-4 py-3 sm:px-6 sm:py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
