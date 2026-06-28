import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const float = (delay = 0, range = 12) => ({
  y: [0, -range, 0],
  x: [0, delay % 2 ? 4 : -4, 0],
  transition: { duration: 5 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay },
})

function Avatar({ initials, gradient }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${gradient}`}
    >
      {initials}
    </div>
  )
}

export default function HeroVisual() {
  return (
    <div className="relative h-full w-full">
      {/* Connection curve */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 500 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.path
          d="M80 120 Q 250 200, 180 300 T 220 480"
          stroke="url(#flowGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative rocket */}
      <motion.div
        animate={float(0.5, 14)}
        className="absolute right-[8%] top-[18%] z-10 hidden lg:block"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-2xl scale-150" />
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="relative drop-shadow-xl">
            <path
              d="M36 8C36 8 20 28 20 44C20 52 27 56 36 64C45 56 52 52 52 44C52 28 36 8 36 8Z"
              fill="url(#rocketGrad)"
            />
            <circle cx="36" cy="38" r="6" fill="white" fillOpacity="0.9" />
            <path d="M28 48L24 58L32 52" fill="#a78bfa" />
            <path d="M44 48L48 58L40 52" fill="#a78bfa" />
            <defs>
              <linearGradient id="rocketGrad" x1="20" y1="8" x2="52" y2="64">
                <stop stopColor="#e0e7ff" />
                <stop offset="0.5" stopColor="#c4b5fd" />
                <stop offset="1" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Card 1 — User Question */}
      <motion.div
        animate={float(0, 10)}
        className="absolute left-[6%] top-[12%] z-20 w-[220px] sm:w-[240px]"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar initials="AK" gradient="bg-gradient-to-br from-slate-600 to-slate-800" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              You ask
            </span>
          </div>
          <p className="text-sm leading-snug text-ink">
            How can I validate my startup idea before quitting my job?
          </p>
        </GlassCard>
      </motion.div>

      {/* Card 2 — Expert Match */}
      <motion.div
        animate={float(0.8, 11)}
        className="absolute right-[4%] top-[32%] z-20 w-[210px] sm:w-[230px]"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar initials="KS" gradient="bg-gradient-to-br from-violet-500 to-indigo-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Expert match
            </span>
          </div>
          <p className="text-sm leading-snug text-ink">
            We match you with an expert who&apos;s done it before.
          </p>
        </GlassCard>
      </motion.div>

      {/* Card 3 — Human Response */}
      <motion.div
        animate={float(1.4, 9)}
        className="absolute left-[10%] top-[48%] z-20 w-[200px] sm:w-[220px]"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar initials="KS" gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Human reply
            </span>
          </div>
          <p className="text-sm leading-snug text-ink">
            You get a thoughtful, personalized response — not AI.
          </p>
        </GlassCard>
      </motion.div>

      {/* Card 4 — Expert Reply / Success */}
      <motion.div
        animate={float(2, 8)}
        className="absolute right-[6%] bottom-[14%] z-20 w-[260px] sm:w-[290px]"
      >
        <GlassCard className="p-5 ring-1 ring-violet-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
              Expert reply
            </span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="text-sm leading-relaxed text-ink/80">
            &ldquo;There are 3 key things to validate: problem intensity, willingness to pay, and your unique edge. Start with 10 customer interviews...&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
            <Avatar initials="KS" gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
            <div>
              <p className="text-xs font-semibold text-ink">Kunal Shah</p>
              <p className="text-[10px] text-muted">Founder · Answered in 4h</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Success Story pill */}
      <motion.div
        animate={float(2.6, 6)}
        className="absolute left-[20%] bottom-[8%] z-20 hidden sm:block"
      >
        <div className="rounded-full glass px-4 py-2 text-xs font-medium text-muted">
          <span className="text-emerald-600">✓</span> Success story · Seed round closed
        </div>
      </motion.div>
    </div>
  )
}
