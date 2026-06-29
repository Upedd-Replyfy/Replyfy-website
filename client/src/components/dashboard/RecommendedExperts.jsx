import { motion, AnimatePresence } from 'framer-motion'
import { Star, BadgeCheck, Clock } from 'lucide-react'
import { fadeUp, staggerContainer } from '../../utils/animations'
import { Skeleton } from '../ui/Skeleton'

function avatarUrl(expert) {
  return (
    expert.profilePhoto ||
    expert.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=111&color=fff`
  )
}

export default function RecommendedExperts({ experts, loading, categoryName, expertTypeName }) {
  if (!loading && !experts.length) return null

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      className="mt-16 md:mt-20"
    >
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Recommended experts
        </h2>
        <p className="mt-2 text-sm text-muted md:text-base">
          Top matches for {categoryName || 'your selection'}
          {expertTypeName ? ` · ${expertTypeName}` : ''}
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${categoryName}-${expertTypeName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="luxury-card p-5">
                  <Skeleton className="mb-4 h-16 w-16 rounded-2xl" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              ))
            : experts.map((expert, index) => (
                <motion.div
                  key={expert._id}
                  variants={fadeUp}
                  custom={index * 0.06}
                  whileHover={{ y: -4 }}
                  className="luxury-card luxury-card-hover p-5 text-left"
                >
                  <div className="relative mb-4 inline-block">
                    <img
                      src={avatarUrl(expert)}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-surface"
                    />
                    {expert.isVerified && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-fg ring-2 ring-card">
                        <BadgeCheck size={11} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink">{expert.name}</p>
                  <p className="text-xs text-muted">{expert.expertType?.name}</p>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-light">
                    {expert.bio}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(expert.skills || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="flex items-center gap-1 text-xs font-semibold text-ink">
                      <Star size={11} fill="currentColor" />
                      {expert.averageRating}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-light">
                      <Clock size={10} />
                      {expert.completedAnswers} answers
                    </span>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  )
}
