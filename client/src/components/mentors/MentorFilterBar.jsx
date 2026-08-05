import { motion } from 'framer-motion'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

const selectClass =
  'h-11 rounded-xl border border-border bg-card px-3 text-sm text-ink outline-none transition focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10'

export default function MentorFilterBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  categoriesLoading,
  experience,
  onExperienceChange,
  minRating,
  onMinRatingChange,
  availability,
  onAvailabilityChange,
  sort,
  onSortChange,
  onReset,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="premium-filter rounded-[24px] p-4 sm:p-5"
      aria-label="Mentor filters"
    >
      <div className="mb-4 flex items-center gap-2 text-muted">
        <SlidersHorizontal size={15} />
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">Filters</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_auto]">
        <label className="relative block min-w-0">
          <span className="sr-only">Search mentors</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, skill, or expertise..."
            className="h-11 w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:bg-card focus:ring-4 focus:ring-[#5B4CFF]/10"
          />
        </label>

        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={categoriesLoading}
          className={selectClass}
          aria-label="Category"
        >
          {categories.map((c) => (
            <option key={c._id || 'all'} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className={selectClass}
          aria-label="Experience"
        >
          <option value="">Experience</option>
          <option value="junior">0–3 years</option>
          <option value="mid">3–7 years</option>
          <option value="senior">7+ years</option>
        </select>

        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className={selectClass}
          aria-label="Minimum rating"
        >
          <option value="">Rating</option>
          <option value="4">4.0+</option>
          <option value="3">3.0+</option>
          <option value="2">2.0+</option>
        </select>

        <select
          value={availability}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className={selectClass}
          aria-label="Availability"
        >
          <option value="">Availability</option>
          <option value="available">Available now</option>
          <option value="any">Any status</option>
        </select>

        <div className="flex gap-2 lg:contents">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className={`${selectClass} min-w-0 flex-1 lg:w-auto`}
            aria-label="Sort mentors"
          >
            <option value="rating">Sort: Rating</option>
            <option value="answers">Sort: Answers</option>
            <option value="name">Sort: Name</option>
            <option value="response">Sort: Response time</option>
          </select>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-muted transition hover:border-[#5B4CFF]/30 hover:text-[#7C6CFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
            aria-label="Reset filters"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </motion.section>
  )
}
