import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import MentorDetailModal from '../mentors/MentorDetailModal'
import MentorCard, { MentorCardSkeleton } from '../mentors/MentorCard'

export default function RecommendedExperts({
  experts,
  loading,
  categoryName,
  expertTypeName,
  onSelectExpert,
}) {
  const [selected, setSelected] = useState(null)
  const [favorites, setFavorites] = useState(() => new Set())
  const [bookmarks, setBookmarks] = useState(() => new Set())

  if (!loading && !experts.length) return null

  const toggleSet = (setter) => (expert) => {
    const id = expert._id
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      className="mt-16 md:mt-20"
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5a0ff]">
            <Sparkles size={12} />
            Matched for you
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Recommended mentors
          </h2>
          <p className="mt-2 text-sm text-muted md:text-base">
            Top matches for {categoryName || 'your selection'}
            {expertTypeName ? ` · ${expertTypeName}` : ''}
          </p>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${categoryName}-${expertTypeName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-4 sm:gap-5 lg:grid-cols-2"
        >
          {loading
            ? [1, 2].map((i) => <MentorCardSkeleton key={i} />)
            : experts.slice(0, 4).map((expert, index) => (
                <MentorCard
                  key={expert._id}
                  expert={expert}
                  index={index}
                  onOpen={setSelected}
                  onAsk={(mentor, planId) => onSelectExpert?.(mentor, planId || 'mentor')}
                  favorited={favorites.has(expert._id)}
                  bookmarked={bookmarks.has(expert._id)}
                  onToggleFavorite={toggleSet(setFavorites)}
                  onToggleBookmark={toggleSet(setBookmarks)}
                />
              ))}
        </motion.div>
      </AnimatePresence>

      <MentorDetailModal
        open={!!selected}
        mentor={selected}
        onClose={() => setSelected(null)}
        onAsk={(mentor, plan) => {
          setSelected(null)
          onSelectExpert?.(mentor, plan)
        }}
      />
    </motion.section>
  )
}
