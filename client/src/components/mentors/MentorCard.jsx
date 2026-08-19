import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CalendarCheck,
  Heart,
  MessageSquare,
  Star,
  Trophy,
  Users,
  Video,
} from 'lucide-react'
import { pickMentorCtaPlans } from '../../constants'
import { usePlans } from '../../hooks/useCatalog'
import { formatRupee } from '../../utils/currency'

function avatarUrl(expert) {
  return (
    expert.profilePhoto ||
    expert.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=111111&color=fff`
  )
}

function formatExperienceLabel(exp) {
  if (!exp || exp === '—' || exp === 'Private') return exp || '—'
  const str = String(exp).trim()
  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = Number(str)
    return `${num} ${num === 1 ? 'Year' : 'Years'} Exp.`
  }
  if (!/year|yr/i.test(str) && /\d/.test(str)) {
    return `${str} Yrs Exp.`
  }
  return str
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
  showMentorType = true,
}) {
  const [hovered, setHovered] = useState(false)
  const showReviews = expert.profileVisibility?.reviews !== false
  const rating = showReviews ? Number(expert.averageRating) || 0 : 0
  const reviews = showReviews ? expert.totalRatings || expert.reviewCount || 0 : 0
  const answers = expert.completedAnswers || 0
  const responseHrs = expert.responseTime || 12
  const rawExperience =
    expert.profileVisibility?.experience === false
      ? 'Private'
      : expert.experience?.trim() || '—'
  const experienceLabel = formatExperienceLabel(rawExperience)
  const available = expert.availability === 'available' || expert.isAvailable
  const isTop = expert.isVerified || rating >= 4.5

  const expertType = expert.expertType?.name || expert.expertTypes?.[0]?.name || ''
  const category = expert.category?.name || expert.categories?.[0]?.name || ''

  const { data: plans } = usePlans()
  const { queryPlan, callPlan } = pickMentorCtaPlans(plans)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2 }}
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-3.5 sm:p-4 transition-all duration-200 hover:border-ink/30 hover:shadow-luxury-md"
    >
      <div className="relative z-[1] flex flex-1 flex-col justify-between">
        {/* Top Header Section: Proportioned Photo on Left, All Data Shifted to Right */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-start">
          {/* Proportioned Mentor Image */}
          <button
            type="button"
            onClick={() => onOpen?.(expert)}
            className="group/avatar relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            aria-label={`View ${expert.name} profile`}
          >
            <img
              src={avatarUrl(expert)}
              alt={expert.name || 'Mentor'}
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-cover ring-1 ring-border/80 shadow-sm transition-transform duration-200 group-hover/avatar:scale-[1.02]"
            />

            {available && (
              <span
                className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border-2 border-card bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm backdrop-blur-sm"
                title="Available Now"
              >
                <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                Online
              </span>
            )}
          </button>

          {/* Right Column with All Data */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Top row: Name & Favorite/Bookmark buttons */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpen?.(expert)}
                  className="text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  <h3 className="truncate text-[15px] font-bold tracking-tight text-ink group-hover:text-primary transition-colors">
                    {expert.name}
                  </h3>
                </button>

                {/* Mentor Type & Category Badges */}
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  {showMentorType && expertType ? (
                    <span className="inline-flex items-center rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                      {expertType}
                    </span>
                  ) : null}
                  {category ? (
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-surface/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                      {category}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Favorites & Bookmarks */}
              <div className="flex shrink-0 items-center gap-1">
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(expert)}
                    className={`flex h-6.5 w-6.5 items-center justify-center rounded-md border transition ${
                      favorited
                        ? 'border-ink bg-ink text-card'
                        : 'border-border bg-surface text-muted-light hover:text-ink'
                    }`}
                    aria-label={favorited ? 'Remove favorite' : 'Favorite'}
                  >
                    <Heart size={11} fill={favorited ? 'currentColor' : 'none'} />
                  </button>
                )}
                {onToggleBookmark && (
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(expert)}
                    className={`flex h-6.5 w-6.5 items-center justify-center rounded-md border transition ${
                      bookmarked
                        ? 'border-ink bg-ink text-card'
                        : 'border-border bg-surface text-muted-light hover:text-ink'
                    }`}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <Bookmark size={11} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
            </div>

            {/* Rating & Reviews */}
            {showReviews && (
              <div className="flex items-center gap-1 text-[11px]">
                <div className="inline-flex items-center gap-0.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-bold text-amber-500">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>{rating ? rating.toFixed(1) : '—'}</span>
                </div>
                <span className="text-[10px] font-medium text-muted">
                  ({reviews} {reviews === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            )}

            {/* Experience, Sessions & Avg Response */}
            <div className="flex flex-col gap-1 text-[11px] text-muted">
              {expert.profileVisibility?.experience !== false && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                  <Briefcase size={12} className="text-muted-light shrink-0" />
                  {experienceLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Users size={12} className="text-muted-light shrink-0" />
                {answers.toLocaleString('en-IN')} mentee engagements
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <CalendarCheck size={12} className="text-muted-light shrink-0" />
                ~{responseHrs}h avg response
              </span>
            </div>

            {/* Bio excerpt */}
            {expert.bio && (
              <p className="line-clamp-1 text-[11px] leading-relaxed text-muted pt-0.5">
                {expert.bio}
              </p>
            )}
          </div>
        </div>

        {(queryPlan || callPlan) && (
        <div className={`mt-3 grid gap-1.5 ${queryPlan && callPlan ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {queryPlan ? (
          <button
            type="button"
            onClick={() => onAsk?.(expert, queryPlan.id)}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-2 text-left transition hover:border-ink/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            <div>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted">
                <MessageSquare size={9} />
                Query
              </span>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink">
                Ask {expert.name?.split(' ')[0] || 'mentor'}
              </p>
            </div>
            <span className="mt-1.5 inline-flex w-fit items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-ink">
              {formatRupee(queryPlan.pricePaise)}
            </span>
          </button>
          ) : null}

          {callPlan ? (
          <button
            type="button"
            onClick={() => onAsk?.(expert, callPlan.id)}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-2 text-left transition hover:border-ink/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            <div>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted">
                <Video size={9} />
                1:1 Call
              </span>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink">
                {callPlan.name}
              </p>
            </div>
            <span className="mt-1.5 inline-flex w-fit items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-ink">
              {formatRupee(callPlan.pricePaise)}
            </span>
          </button>
          ) : null}
        </div>
        )}

        {/* View Profile Button */}
        <motion.button
          type="button"
          onClick={() => onOpen?.(expert)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
          }}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-card transition hover:bg-ink/90"
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
    <div className="h-[230px] animate-pulse rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-xl bg-surface" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-32 rounded bg-surface" />
          <div className="flex gap-1.5">
            <div className="h-4 w-20 rounded bg-surface" />
            <div className="h-4 w-16 rounded bg-surface" />
          </div>
          <div className="h-3 w-24 rounded bg-surface" />
          <div className="h-3 w-36 rounded bg-surface" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <div className="h-14 rounded-xl border border-border bg-surface" />
        <div className="h-14 rounded-xl border border-border bg-surface" />
      </div>
    </div>
  )
}
