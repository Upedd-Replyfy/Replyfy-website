import { motion } from 'framer-motion'

export default function AdminStatStrip({ items = [] }) {
  if (!items.length) return null

  return (
    <div
      className={`grid gap-3 ${
        items.length === 1
          ? 'grid-cols-1'
          : items.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : items.length === 3
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -2 }}
            className="admin-panel flex items-center gap-3.5 rounded-[18px] border border-border bg-card px-4 py-3.5"
          >
            {Icon ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_8px_16px_rgba(79,70,229,0.25)]">
                <Icon size={18} />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-lg font-bold tracking-tight text-slate-900">
                {item.value}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
