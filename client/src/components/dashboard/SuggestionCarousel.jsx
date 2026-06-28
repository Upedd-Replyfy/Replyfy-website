import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SuggestionCarousel({ category, onSelect }) {
  const suggestions = category?.suggestions || []
  if (!suggestions.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={14} className="text-muted" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-light">
          Suggested for {category?.name || 'you'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSelect(text)}
            className="luxury-card luxury-card-hover p-4 text-left text-sm leading-relaxed text-ink"
          >
            {text}
          </button>
        ))}
      </div>
    </motion.section>
  )
}
