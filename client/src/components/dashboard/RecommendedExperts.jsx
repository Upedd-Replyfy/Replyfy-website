import { useState } from 'react'
import { motion } from 'framer-motion'
import MentorDetailModal from '../mentors/MentorDetailModal'
import MentorCard, { MentorCardSkeleton } from '../mentors/MentorCard'
import SectionPager from './SectionPager'

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Matched for you
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
          Recommended mentors
        </h2>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Top matches for {categoryName || 'your selection'}
          {expertTypeName ? ` · ${expertTypeName}` : ''}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <SectionPager
          items={experts}
          pageSize={4}
          columnsClassName="grid-cols-1 sm:grid-cols-2"
          ariaLabel="Recommended mentors pages"
          renderItem={(expert, index) => (
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
          )}
        />
      )}

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
