import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CalendarCheck,
  Heart,
  MessageSquare,
  MonitorPlay,
  Star,
  Trophy,
  Video,
} from 'lucide-react'
import { PLANS } from '../../constants'
import { formatRupee } from '../../utils/currency'

function avatarUrl(expert) {
  return (
    expert.profilePhoto ||
    expert.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=111111&color=fff`
  )
}

function roleLine(expert) {
  const type = expert.expertType?.name || expert.expertTypes?.[0]?.name || 'Mentor'
  const cat = expert.category?.name || expert.categories?.[0]?.name
  const bio = expert.bio?.trim()
  if (bio) return bio
  return [type, cat, expert.experience].filter(Boolean).join(' · ')
}

function categoryInitial(expert) {
  const name = expert.category?.name || expert.categories?.[0]?.name || 'R'
  return name.slice(0, 1).toUpperCase()
}

export default function MentorCard({
  expert,
  index = 0,
  onOpen,
  onAsk,
  favorited = false,
  bookmarked = false,
  onToggleFavorite,
  onToggleBookmark,
}) {
  const [hovered, setHovered] = useState(false)
  const showReviews = expert.profileVisibility?.reviews !== false
  const rating = showReviews ? Number(expert.averageRating) || 0 : 0
  const reviews = showReviews ? expert.totalRatings || expert.reviewCount || 0 : 0
  const answers = expert.completedAnswers || 0
  const experience =
    expert.profileVisibility?.experience === false
      ? 'Private'
      : expert.experience?.trim() || '—'
  const available = expert.availability === 'available' || expert.isAvailable
  const isTop = expert.isVerified || rating >= 4.5

  const queryPlan = PLANS.mentor
  const callPlan = PLANS.expert_call

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2 }}
      className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-3 transition hover:border-ink/25"
    >
      <div className="relative z-[1] flex flex-1 flex-col">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => onOpen?.(expert)}
            className="relative shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            aria-label={`View ${expert.name} profile`}
          >
            <img
              src={avatarUrl(expert)}
              alt=""
              className="h-11 w-11 rounded-lg object-cover ring-1 ring-border"
            />
            {isTop && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded bg-ink text-card ring-2 ring-card">
                <Trophy size={8} />
              </span>
            )}
            {available && (
              <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpen?.(expert)}
                  className="text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">
                    {expert.name}
                  </h3>
                </button>
                {showReviews ? (
                  <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px]">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-ink">
                      {rating ? rating.toFixed(1) : '—'}
                    </span>
                    <span className="text-muted-light">
                      ({reviews} Review{reviews === 1 ? '' : 's'})
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span
                  className="hidden h-6 w-6 items-center justify-center rounded-md border border-border bg-surface text-[10px] font-bold text-ink sm:flex"
                  title={expert.category?.name || 'Category'}
                >
                  {categoryInitial(expert)}
                </span>
                {onToggleFavorite ? (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(expert)}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                      favorited
                        ? 'border-ink bg-ink text-card'
                        : 'border-border bg-surface text-muted-light hover:text-ink'
                    }`}
                    aria-label={favorited ? 'Remove favorite' : 'Favorite'}
                  >
                    <Heart size={11} fill={favorited ? 'currentColor' : 'none'} />
                  </button>
                ) : null}
                {onToggleBookmark ? (
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(expert)}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                      bookmarked
                        ? 'border-ink bg-ink text-card'
                        : 'border-border bg-surface text-muted-light hover:text-ink'
                    }`}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <Bookmark size={11} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                ) : null}
              </div>
            </div>

            <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-muted">
              {roleLine(expert)}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted">
          {expert.profileVisibility?.experience !== false ? (
            <span className="inline-flex items-center gap-1">
              <Briefcase size={10} className="text-muted-light" />
              {experience}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <MonitorPlay size={10} className="text-muted-light" />
            {answers.toLocaleString('en-IN')} Sessions
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarCheck size={10} className="text-muted-light" />
            {available ? '99%' : '—'} Avg.
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onAsk?.(expert, queryPlan.id)}
            className="flex flex-col rounded-lg border border-border bg-surface/70 p-2 text-left transition hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <MessageSquare size={10} />
              Query
            </span>
            <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink">
              Ask {expert.name?.split(' ')[0] || 'mentor'}
            </p>
            <span className="mt-1 inline-flex w-fit items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-ink">
              {formatRupee(queryPlan.pricePaise)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onAsk?.(expert, callPlan.id)}
            className="flex flex-col rounded-lg border border-border bg-surface/70 p-2 text-left transition hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <Video size={10} />
              1:1 Call
            </span>
            <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink">
              Live mentor session
            </p>
            <span className="mt-1 inline-flex w-fit items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-ink">
              {formatRupee(callPlan.pricePaise)}
            </span>
          </button>
        </div>

        <motion.button
          type="button"
          onClick={() => onOpen?.(expert)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
          }}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[12px] font-semibold text-card transition hover:bg-ink/90"
        >
          View profile
          <ArrowRight size={12} />
        </motion.button>
      </div>
    </motion.article>
  )
}

export function MentorCardSkeleton() {
  return (
    <div className="h-[210px] animate-pulse rounded-xl border border-border bg-card p-3">
      <div className="flex gap-2.5">
        <div className="h-11 w-11 rounded-lg bg-surface" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-28 rounded bg-surface" />
          <div className="h-3 w-20 rounded bg-surface" />
        </div>
      </div>
      <div className="mt-3 h-3 w-2/3 rounded bg-surface" />
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <div className="h-14 rounded-lg border border-border bg-surface" />
        <div className="h-14 rounded-lg border border-border bg-surface" />
      </div>
    </div>
  )
}
