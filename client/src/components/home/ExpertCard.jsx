import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function ExpertCard({ expert, isCenter, dark = false }) {
  return (
    <div
      className={`h-full w-full overflow-hidden rounded-[20px] border select-none ${
        dark
          ? 'border-white/10 bg-neutral-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)]'
          : 'border-border bg-card shadow-[var(--shadow-luxury-lg)]'
      }`}
      style={{ userSelect: 'none' }}
    >
      <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden">
        <img
          src={expert.image}
          alt={expert.name}
          className="h-full w-full object-cover object-top"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {expert.topExpert && (
          <span className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black shadow-sm">
            <Star size={10} fill="currentColor" />
            Top Mentor
          </span>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur px-3 py-1.5 shadow-sm ring-1 ring-white/10">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className="text-amber-400"
                fill={i < Math.floor(expert.rating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-white">{expert.rating}</span>
          <span className="text-[10px] text-white/60">({expert.answers})</span>
        </div>
      </div>

      <div className={`p-4 md:p-5 transition-all duration-500 ${isCenter ? 'opacity-100' : 'opacity-90'}`}>
        <h3 className={`text-lg md:text-xl font-semibold tracking-tight leading-tight ${dark ? 'text-white' : 'text-ink'}`}>
          {expert.name}
        </h3>
        <p className={`mt-1 text-sm ${dark ? 'text-white/55' : 'text-muted'}`}>{expert.role}</p>

        {isCenter && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={`mt-3 text-sm leading-relaxed line-clamp-2 ${dark ? 'text-white/55' : 'text-muted'}`}>
              {expert.bio}
            </p>
            <p className={`mt-3 text-xs ${dark ? 'text-white/45' : 'text-muted'}`}>
              <span className={`font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{expert.experience}</span>{' '}
              experience ·{' '}
              <span className={`font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{expert.answers}+</span> answers
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {expert.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    dark
                      ? 'bg-white/10 text-white/70 ring-1 ring-white/10'
                      : 'bg-surface text-muted ring-1 ring-border'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {!isCenter && (
          <p className={`mt-2 text-xs line-clamp-1 ${dark ? 'text-white/45' : 'text-muted'}`}>{expert.bio}</p>
        )}
      </div>
    </div>
  )
}
