import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { getQuestionSuggestions } from '../../utils/questionPrompts'

export default function SuggestionCarousel({ category, expertType, onSelect }) {
  const suggestions = getQuestionSuggestions(category, expertType)
  if (!suggestions.length) return null

  const label = expertType?.name
    ? `Suggested for ${category?.name || 'you'} · ${expertType.name}`
    : `Suggested for ${category?.name || 'you'}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={14} className="text-muted" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-light">{label}</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category?._id || category?.name}-${expertType?._id || expertType?.name}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid gap-3 sm:grid-cols-3"
        >
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
        </motion.div>
      </AnimatePresence>
    </motion.section>
  )
}
