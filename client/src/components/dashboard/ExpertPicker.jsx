import { motion } from 'framer-motion'
import { Star, Clock, BadgeCheck, MessageSquare, ShieldCheck, Globe } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState, ErrorState } from '../catalog/CatalogSelectors'

function ExpertCardSkeleton() {
  return (
    <div className="luxury-card p-5">
      <div className="flex gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </div>
    </div>
  )
}

function avatarUrl(expert) {
  return (
    expert.profilePhoto ||
    expert.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'Expert')}&background=111&color=fff`
  )
}

export default function ExpertPicker({
  experts,
  selected,
  onSelect,
  onContinue,
  loading,
  error,
  onRetry,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Choose your expert</h2>
      <p className="mt-2 text-sm text-muted">
        Premium plan — compare profiles and select who answers your question.
      </p>

      {error && <div className="mt-8"><ErrorState message={error} onRetry={onRetry} /></div>}

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <ExpertCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && experts.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No experts available"
            message="No verified experts match this category and type right now. Try a different expert type or check back later."
          />
        </div>
      )}

      {!loading && !error && experts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {experts.map((expert) => {
            const active = selected?._id === expert._id
            return (
              <button
                key={expert._id}
                type="button"
                onClick={() => onSelect(expert)}
                className={`luxury-card p-5 text-left transition-all ${
                  active ? 'ring-2 ring-ink shadow-[var(--shadow-luxury-md)]' : 'luxury-card-hover'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={avatarUrl(expert)}
                    alt=""
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-surface"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{expert.name}</p>
                      {expert.isVerified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      )}
                      {expert.availability === 'available' && (
                        <span className="flex items-center gap-0.5 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-ink">
                          <BadgeCheck size={10} /> Available
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {expert.expertType?.name} · {expert.category?.name}
                    </p>
                    <p className="text-xs text-muted-light">{expert.experience} experience</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{expert.bio}</p>

                {(expert.languages?.length > 0 || expert.skills?.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {expert.languages?.slice(0, 3).map((lang) => (
                      <span key={lang} className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted">
                        <Globe size={9} /> {lang}
                      </span>
                    ))}
                    {expert.skills?.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <span className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-ink">
                    <Star size={12} fill="currentColor" />
                    {expert.averageRating} ({expert.reviewCount || expert.totalRatings} reviews)
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-muted">
                    <MessageSquare size={12} />
                    {expert.completedAnswers} answers
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-muted">
                    <Clock size={12} />
                    {expert.responseTime}h response
                  </span>
                  <span className="rounded-lg bg-surface px-2.5 py-1.5 font-semibold text-ink">
                    ₹{(expert.questionPrice || 0) / 100}
                  </span>
                </div>

                <span
                  className={`mt-4 block w-full rounded-xl py-2 text-center text-xs font-semibold ${
                    active ? 'bg-ink text-white' : 'border border-border text-ink'
                  }`}
                >
                  {active ? 'Selected' : 'Select'}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className="btn-primary mt-8 w-full rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-40 sm:w-auto sm:px-8"
      >
        Continue to payment
      </button>
    </motion.div>
  )
}
