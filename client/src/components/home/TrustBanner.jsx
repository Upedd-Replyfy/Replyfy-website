import { Plus } from 'lucide-react'

const avatars = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
]

export default function TrustBanner({ className = '' }) {
  return (
    <section className={`w-full border-t border-b border-white/25 bg-white ${className}`}>
      <div className="page-container flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between md:py-7 lg:gap-6 lg:py-8">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
            Trusted by founders &amp; professionals
          </span>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-black md:text-2xl">
            Get advice that actually helps.
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {avatars.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                draggable={false}
              />
            ))}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#272927] text-white ring-2 ring-white">
              <Plus size={14} strokeWidth={2.5} />
            </span>
          </div>
          <p className="max-w-[14rem] text-sm leading-snug text-black/50">
            Join 1,000+ people getting mentor answers
          </p>
        </div>
      </div>
    </section>
  )
}
