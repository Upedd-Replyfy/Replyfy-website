import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'You ask',
    body: 'How can I validate my startup idea?',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    className: 'left-[10%] top-[12%] w-[190px] md:w-[230px]',
  },
  {
    number: '2',
    title: 'We match you with an expert',
    body: 'Our AI + human team finds the perfect expert for you.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
    className: 'right-[6%] top-[21%] w-[210px] md:w-[245px]',
  },
  {
    number: '3',
    title: 'You get a human reply',
    body: 'Real advice. Real experience. Real impact.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    className: 'left-[1%] top-[50%] w-[210px] md:w-[245px]',
  },
]

function StepCard({ step, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-20 rounded-2xl border border-black/6 bg-white/90 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.08)] backdrop-blur-xl ${step.className}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={step.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white grayscale"
          draggable={false}
        />
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
              {step.number}
            </span>
            <p className="text-xs font-semibold leading-tight text-ink">{step.title}</p>
          </div>
          <p className="text-[10px] leading-snug text-muted">{step.body}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function HeroOrbitVisual() {
  return (
    <div className="relative h-full min-h-[430px] w-full overflow-hidden lg:min-h-[640px]">
      <div className="pointer-events-none absolute right-[8%] top-[-12%] h-52 w-52 rounded-full bg-neutral-200/40 blur-[70px]" />
      <div className="pointer-events-none absolute bottom-[5%] left-[4%] h-56 w-56 rounded-full bg-neutral-300/30 blur-[80px]" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 620 560"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.circle
          cx="322"
          cy="228"
          r="170"
          stroke="#a3a3a3"
          strokeOpacity="0.2"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
        <motion.circle
          cx="322"
          cy="228"
          r="118"
          stroke="#d4d4d4"
          strokeOpacity="0.15"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: 'easeOut' }}
        />
        <motion.path
          d="M170 82 C 300 54, 432 80, 500 190 C 575 312, 488 452, 335 452"
          stroke="#a3a3a3"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="5 9"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.25, ease: 'easeOut' }}
        />
        <circle cx="180" cy="92" r="4" fill="#525252" opacity="0.5" />
        <circle cx="505" cy="196" r="3.5" fill="#737373" opacity="0.5" />
        <circle cx="340" cy="452" r="4" fill="#a3a3a3" opacity="0.6" />
      </svg>

      {steps.map((step, index) => (
        <StepCard key={step.number} step={step} delay={0.22 + index * 0.1} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[9%] right-[2%] z-30 w-[260px] rounded-2xl border border-black/6 bg-white/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-xl md:right-[9%] md:w-[310px]"
      >
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Expert Reply</p>
        <p className="mt-3 text-xs leading-relaxed text-ink/75">
          There are 3 key things to validate before you build anything...
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[11px] font-semibold text-white"
        >
          View full answer
          <ArrowRight size={13} />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, rotate: -8 }}
        animate={{ opacity: 1, x: 0, rotate: -8, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.85 },
          x: { duration: 0.6, delay: 0.85 },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute right-[2%] top-[45%] z-10 hidden h-24 w-24 md:block"
      >
        <div className="absolute inset-0 rounded-full bg-neutral-300/20 blur-2xl" />
        <div className="relative h-full w-full">
          <div className="absolute left-8 top-1 h-20 w-11 rounded-t-full rounded-b-[28px] bg-gradient-to-b from-white via-neutral-200 to-neutral-400 shadow-xl shadow-black/10" />
          <div className="absolute left-[47px] top-8 h-5 w-5 rounded-full bg-white/90 ring-4 ring-neutral-300" />
          <div className="absolute left-4 top-12 h-8 w-7 -rotate-12 rounded-tl-full bg-neutral-300" />
          <div className="absolute right-3 top-12 h-8 w-7 rotate-12 rounded-tr-full bg-neutral-400" />
        </div>
      </motion.div>
    </div>
  )
}
