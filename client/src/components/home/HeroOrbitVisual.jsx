import { useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const VIEW_W = 600
const VIEW_H = 520

// Anchor points (% of viewBox) for sequential path 1 → 2 → 3 → 4
const anchors = [
  { x: 16, y: 18 }, // 1 top-left
  { x: 84, y: 26 }, // 2 top-right
  { x: 14, y: 68 }, // 3 bottom-left
  { x: 82, y: 88 }, // 4 bottom-right
]

const toCoord = (p) => ({
  x: (p.x / 100) * VIEW_W,
  y: (p.y / 100) * VIEW_H,
})

const [a1, a2, a3, a4] = anchors.map(toCoord)

const sequencePath = `
  M ${a1.x} ${a1.y}
  C ${a1.x + 120} ${a1.y - 20}, ${a2.x - 100} ${a2.y - 10}, ${a2.x} ${a2.y}
  C ${a2.x - 40} ${a2.y + 100}, ${a3.x + 80} ${a3.y - 60}, ${a3.x} ${a3.y}
  C ${a3.x + 100} ${a3.y + 30}, ${a4.x - 80} ${a4.y - 10}, ${a4.x} ${a4.y}
`

const steps = [
  {
    number: '1',
    title: 'You ask',
    body: 'How can I validate my startup idea?',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    className: 'left-[3%] top-[6%] lg:left-[5%] lg:top-[8%]',
    parallax: 8,
    accent: 'from-sky-400 to-blue-500',
    ring: 'ring-sky-400/50',
    delay: 0.35,
  },
  {
    number: '2',
    title: 'We match you with an expert',
    body: 'Our AI + human team finds the perfect expert.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
    className: 'right-[2%] top-[18%] lg:right-[4%] lg:top-[20%]',
    parallax: 10,
    accent: 'from-violet-400 to-purple-500',
    ring: 'ring-violet-400/50',
    delay: 0.45,
  },
  {
    number: '3',
    title: 'You get a human reply',
    body: 'Real advice. Real experience. Real impact.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    className: 'left-[1%] bottom-[26%] lg:left-[3%] lg:bottom-[28%]',
    parallax: 9,
    accent: 'from-blue-400 to-violet-500',
    ring: 'ring-blue-400/50',
    delay: 0.55,
  },
  {
    number: '4',
    title: 'Expert Reply',
    body: 'There are 3 key things to validate before you build anything...',
    isReply: true,
    className: 'right-[2%] bottom-[4%] lg:right-[4%] lg:bottom-[6%]',
    parallax: 11,
    accent: 'from-sky-400 to-violet-500',
    delay: 0.65,
  },
]

function Float({ children, mouse, strength, delay, className, style }) {
  const x = useSpring(0, { stiffness: 90, damping: 24 })
  const y = useSpring(0, { stiffness: 90, damping: 24 })

  useEffect(() => {
    x.set(mouse.x * strength)
    y.set(mouse.y * strength)
  }, [mouse.x, mouse.y, strength, x, y])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ x, y, ...style }}
      className={`absolute z-20 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function StepNode({ step, mouse }) {
  if (step.isReply) {
    return (
      <Float
        mouse={mouse}
        strength={step.parallax}
        delay={step.delay}
        className={`max-w-[195px] sm:max-w-[210px] ${step.className}`}
      >
        <div className="relative pl-1">
          <span
            className={`absolute -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br ${step.accent} text-[9px] font-bold text-white`}
          >
            {step.number}
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/80">
            {step.title}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{step.body}</p>
          <button
            type="button"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-3.5 py-2 text-[11px] font-semibold text-white"
          >
            View full answer
            <ArrowRight size={12} />
          </button>
        </div>
      </Float>
    )
  }

  return (
    <Float
      mouse={mouse}
      strength={step.parallax}
      delay={step.delay}
      className={`max-w-[185px] sm:max-w-[200px] ${step.className}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={step.image}
            alt=""
            className={`h-9 w-9 rounded-full object-cover ring-2 ${step.ring} sm:h-10 sm:w-10`}
            draggable={false}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br ${step.accent} text-[9px] font-bold text-white`}
          >
            {step.number}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-snug text-white/90">{step.title}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-white/40 sm:text-[11px]">{step.body}</p>
        </div>
      </div>
    </Float>
  )
}

export default function HeroOrbitVisual({ mouse = { x: 0, y: 0 } }) {
  const orbitX = useSpring(0, { stiffness: 70, damping: 22 })
  const orbitY = useSpring(0, { stiffness: 70, damping: 22 })

  useEffect(() => {
    orbitX.set(mouse.x * 4)
    orbitY.set(mouse.y * 4)
  }, [mouse.x, mouse.y, orbitX, orbitY])

  return (
    <div className="relative mx-auto h-full w-full max-w-[580px] lg:max-w-[620px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.07] blur-[50px]" />

      <motion.div
        style={{ x: orbitX, y: orbitY }}
        className="pointer-events-none absolute inset-[8%] lg:inset-[10%]"
      >
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="seqPath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          <motion.path
            d={sequencePath}
            stroke="url(#seqPath)"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.15, ease: 'easeInOut' }}
          />

          {[a1, a2, a3, a4].map((pt, i) => (
            <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.2 }}>
              <circle cx={pt.x} cy={pt.y} r="6" fill="#818cf8" fillOpacity="0.2" />
              <circle cx={pt.x} cy={pt.y} r="3" fill="#a78bfa" fillOpacity="0.9" />
            </motion.g>
          ))}
        </svg>
      </motion.div>

      {steps.map((step) => (
        <StepNode key={step.number} step={step} mouse={mouse} />
      ))}
    </div>
  )
}
