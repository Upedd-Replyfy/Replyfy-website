import { Star } from 'lucide-react'

export default function ExpertCard({ expert }) {
  const rating = Number(expert.rating) || 0
  const answers = Number(expert.answers) || 0

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden rounded-[18px] border border-black/10 bg-neutral-200 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      style={{ userSelect: 'none' }}
    >
      <img
        src={expert.image}
        alt={expert.name}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
        draggable={false}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10"
      />

      {expert.topExpert && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black shadow-sm">
          <Star size={10} fill="currentColor" />
          Top Mentor
        </span>
      )}

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 ring-1 ring-white/15">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={9}
              className="text-amber-400"
              fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <span className="text-[10px] font-semibold text-white">{rating}</span>
        <span className="text-[9px] text-white/65">({answers})</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 sm:p-4">
        <h3 className="text-base font-semibold leading-tight tracking-tight text-white sm:text-lg">
          {expert.name}
        </h3>
        <p className="mt-0.5 text-xs text-white/80 sm:text-sm">{expert.role}</p>

        {expert.bio ? (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/70 sm:text-xs">
            {expert.bio}
          </p>
        ) : null}

        <p className="mt-2 text-[10px] text-white/65 sm:text-[11px]">
          <span className="font-semibold text-white/90">
            {expert.experience || 'Verified'}
          </span>{' '}
          experience ·{' '}
          <span className="font-semibold text-white/90">{answers}+</span> answers
        </p>

        {expert.tags?.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {expert.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/85 ring-1 ring-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
