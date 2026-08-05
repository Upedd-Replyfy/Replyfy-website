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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=5B4CFF&color=fff`
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
  const rating = Number(expert.averageRating) || 0
  const reviews = expert.totalRatings || expert.reviewCount || 0
  const answers = expert.completedAnswers || 0
  const experience = expert.experience?.trim() || '—'
  const available = expert.availability === 'available' || expert.isAvailable
  const isTop = expert.isVerified || rating >= 4.5

  const queryPlan = PLANS.mentor
  const callPlan = PLANS.expert_call

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="premium-surface group relative flex h-full flex-col rounded-[16px] p-3.5 transition-[box-shadow,border-color] duration-250 hover:border-[#5B4CFF]/50 sm:p-4"
    >
      <div className="relative z-[1] flex flex-1 flex-col">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onOpen?.(expert)}
            className="relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
            aria-label={`View ${expert.name} profile`}
          >
            <img
              src={avatarUrl(expert)}
              alt=""
              className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
            />
            {isTop && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow ring-2 ring-card">
                <Trophy size={10} />
              </span>
            )}
            {available && (
              <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpen?.(expert)}
                  className="text-left outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
                >
                  <h3 className="truncate text-[16px] font-semibold tracking-tight text-ink sm:text-[17px]">
                    {expert.name}
                  </h3>
                </button>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px]">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-ink">
                    {rating ? rating.toFixed(1) : '—'}
                  </span>
                  <span className="text-muted-light">
                    ({reviews} Review{reviews === 1 ? '' : 's'})
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span
                  className="hidden h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-[11px] font-bold text-[#7C6CFF] sm:flex"
                  title={expert.category?.name || 'Category'}
                >
                  {categoryInitial(expert)}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(expert)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                    favorited
                      ? 'border-rose-400/40 bg-rose-500/15 text-rose-400'
                      : 'border-border bg-surface text-muted-light hover:text-[#7C6CFF]'
                  }`}
                  aria-label={favorited ? 'Remove favorite' : 'Favorite'}
                >
                  <Heart size={12} fill={favorited ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark?.(expert)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                    bookmarked
                      ? 'border-[#5B4CFF]/40 bg-[#5B4CFF]/15 text-[#7C6CFF]'
                      : 'border-border bg-surface text-muted-light hover:text-[#7C6CFF]'
                  }`}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  <Bookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted">
              {roleLine(expert)}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Briefcase size={11} className="text-muted-light" />
            {experience}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <MonitorPlay size={11} className="text-muted-light" />
            {answers.toLocaleString('en-IN')} Sessions
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <CalendarCheck size={11} className="text-muted-light" />
            {available ? '99%' : '—'} Avg. Attendance
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAsk?.(expert, queryPlan.id)}
            className="premium-surface-inner flex flex-col rounded-xl p-2 text-left transition hover:border-[#5B4CFF]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <MessageSquare size={10} className="text-[#7C6CFF]" />
              Query
            </span>
            <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-ink">
              Ask {expert.name?.split(' ')[0] || 'mentor'}
            </p>
            <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
              {formatRupee(queryPlan.pricePaise)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onAsk?.(expert, callPlan.id)}
            className="premium-surface-inner flex flex-col rounded-xl p-2 text-left transition hover:border-[#5B4CFF]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <Video size={10} className="text-[#7C6CFF]" />
              1:1 Call
            </span>
            <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-ink">
              Live mentor session
            </p>
            <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-[#5B4CFF]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#a5a0ff]">
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
            boxShadow: hovered
              ? '0 10px 24px rgba(91,76,255,0.35)'
              : '0 6px 14px rgba(91,76,255,0.2)',
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B4CFF] to-[#7C6CFF] px-3 py-2 text-[12px] font-semibold text-white transition hover:brightness-110"
        >
          View profile
          <ArrowRight size={13} />
        </motion.button>
      </div>
    </motion.article>
  )
}

export function MentorCardSkeleton() {
  return (
    <div className="premium-surface h-[260px] animate-pulse rounded-[16px] p-4">
      <div className="relative z-[1] flex gap-3">
        <div className="h-14 w-14 rounded-xl bg-surface" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-32 rounded-lg bg-surface" />
          <div className="h-3 w-24 rounded-lg bg-surface" />
          <div className="h-3 w-full rounded-lg bg-surface" />
        </div>
      </div>
      <div className="relative z-[1] mt-3 h-3 w-2/3 rounded-lg bg-surface" />
      <div className="relative z-[1] mt-3 grid grid-cols-2 gap-2">
        <div className="premium-surface-inner h-16 rounded-xl" />
        <div className="premium-surface-inner h-16 rounded-xl" />
      </div>
    </div>
  )
}
