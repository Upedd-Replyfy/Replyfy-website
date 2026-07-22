import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate, useMotionValue, useTransform } from 'framer-motion'
import {
  MessageSquare,
  Users,
  UserCheck,
  Send,
  Shield,
  Zap,
  Star,
} from 'lucide-react'
import { fadeUp } from '../../utils/animations'

const steps = [
  {
    icon: MessageSquare,
    title: 'Ask your question',
    description:
      'Describe your situation in detail. The more context, the better the answer.',
  },
  {
    icon: Users,
    title: 'We match a mentor',
    description:
      'Our system matches you with a verified mentor who has solved this before.',
  },
  {
    icon: UserCheck,
    title: 'Mentor reviews',
    description:
      'A real human reviews your question and crafts a thoughtful, personalized response.',
  },
  {
    icon: Send,
    title: 'Receive your answer',
    description:
      'Get a detailed answer in your dashboard with the option to ask follow-ups.',
  },
]

const features = [
  { icon: Shield, title: 'Verified mentors', description: 'Every mentor is vetted for credibility.' },
  { icon: Zap, title: 'Faster clarity', description: 'Get answers in hours, not weeks.' },
  { icon: Star, title: 'Actionable advice', description: 'Real-world insights you can actually use.' },
]

const CARD_CENTERS = [12.5, 37.5, 62.5, 87.5]
const DOT_POSITIONS = [16.66, 50, 83.33]
const POP_PAUSE_MS = 280
const TRAVEL_MS = 520

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function StepConnector({ lineProgress, activeCard }) {
  const glowLeft = useTransform(lineProgress, (v) => `${v}%`)
  const trailWidth = useTransform(lineProgress, (v) => `${Math.max(v - CARD_CENTERS[0], 0)}%`)
  const trailLeft = `${CARD_CENTERS[0]}%`

  return (
    <div
      className="pointer-events-none absolute inset-x-[0.5%] top-[80px] hidden lg:block"
      aria-hidden
    >
      <div className="relative h-px w-full">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-black/20" />

        <motion.div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-400 to-violet-500"
          style={{ left: trailLeft, width: trailWidth }}
        />

        <motion.div
          className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_6px_rgba(56,189,248,0.55),0_0_28px_10px_rgba(139,92,246,0.35)]"
          style={{ left: glowLeft }}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />
        </motion.div>

        {DOT_POSITIONS.map((left, i) => {
          const lit = activeCard > i
          return (
            <motion.span
              key={left}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${left}%` }}
              animate={{
                backgroundColor: lit ? '#8b5cf6' : '#171717',
                boxShadow: lit
                  ? '0 0 12px 4px rgba(139,92,246,0.45)'
                  : '0 0 0 0 rgba(0,0,0,0)',
                scale: lit ? 1.25 : 1,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            />
          )
        })}
      </div>
    </div>
  )
}

function StepCard({ step, index, visible }) {
  const Icon = step.icon
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      className="relative z-10 h-full"
      initial={{ opacity: 0, y: 36, scale: 0.88 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 36, scale: 0.88 }
      }
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 20,
        mass: 0.85,
      }}
    >
      <motion.div
        initial="rest"
        whileHover={visible ? 'hover' : 'rest'}
        whileTap={visible ? 'press' : 'rest'}
        variants={{
          rest: {
            y: 0,
            scale: 1,
            boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
            borderColor: 'rgba(0,0,0,0.07)',
          },
          hover: {
            y: -8,
            scale: 1.02,
            boxShadow: '0 24px 56px rgba(99,102,241,0.18)',
            borderColor: 'rgba(139,92,246,0.35)',
          },
          press: {
            y: -2,
            scale: 0.98,
            boxShadow: '0 16px 40px rgba(99,102,241,0.22)',
            borderColor: 'rgba(56,189,248,0.45)',
          },
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="flex h-full min-h-[200px] cursor-pointer flex-col items-center rounded-[20px] border bg-white px-5 py-6 text-center sm:px-7 md:min-h-[230px] md:px-10 md:py-7 lg:min-h-[240px] lg:px-11"
      >
        <span className="text-sm font-medium tracking-widest text-black/35">{num}</span>

        <motion.div
          variants={{
            rest: {
              scale: 1,
              rotate: 0,
            },
            hover: {
              scale: 1.14,
              rotate: [0, -10, 10, 0],
            },
            press: {
              scale: 1.06,
              rotate: 0,
            },
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className={`mt-3 flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 ${
            visible
              ? 'bg-gradient-to-br from-sky-500/15 to-violet-500/20 text-violet-600'
              : 'bg-black/[0.04] text-black'
          }`}
        >
          <motion.span
            variants={{
              rest: { y: 0, scale: 1 },
              hover: { y: [0, -4, 0], scale: 1.08 },
              press: { y: 0, scale: 0.94 },
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="inline-flex"
          >
            <Icon size={26} strokeWidth={1.6} />
          </motion.span>
        </motion.div>

        <h3 className="mt-4 text-base font-semibold tracking-tight text-black md:text-lg">
          {step.title}
        </h3>
        <p className="mt-2 max-w-[312px] text-sm leading-relaxed text-black/50 md:text-[15px]">
          {step.description}
        </p>
      </motion.div>
    </motion.article>
  )
}

export default function HowItWorks() {
  const stepsRef = useRef(null)
  const isInView = useInView(stepsRef, { once: true, amount: 0.35 })
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeCard, setActiveCard] = useState(-1)
  const lineProgress = useMotionValue(CARD_CENTERS[0])
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isInView || startedRef.current) return undefined
    startedRef.current = true

    let cancelled = false
    let activeAnim = null

    async function runSequence() {
      setVisibleCount(1)
      setActiveCard(0)
      lineProgress.set(CARD_CENTERS[0])
      await wait(POP_PAUSE_MS)
      if (cancelled) return

      for (let i = 1; i < steps.length; i += 1) {
        activeAnim = animate(lineProgress, CARD_CENTERS[i], {
          duration: TRAVEL_MS / 1000,
          ease: [0.22, 1, 0.36, 1],
        })
        await activeAnim
        if (cancelled) return

        setVisibleCount(i + 1)
        setActiveCard(i)
        await wait(POP_PAUSE_MS)
        if (cancelled) return
      }
    }

    runSequence()

    return () => {
      cancelled = true
      activeAnim?.stop?.()
    }
  }, [isInView, lineProgress])

  return (
    <section id="how-it-works" className="relative w-full overflow-hidden bg-[#f5f5f5] py-10 md:py-14 lg:py-16">
      <div className="page-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
        >
          <span className="inline-flex rounded-full border border-black/10 bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">
            How it works
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black leading-[1.12] md:text-3xl lg:text-[2.125rem]">
            From question to clarity
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              in four simple steps
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-black/50 md:text-base">
            Get personalized answers from verified mentors in four simple steps.
          </p>
        </motion.div>

        <div
          ref={stepsRef}
          className="relative mx-auto w-full max-w-[1650px] px-0 sm:px-6 lg:px-8"
        >
          <StepConnector lineProgress={lineProgress} activeCard={activeCard} />

          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10 xl:gap-12">
            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                step={step}
                index={index}
                visible={index < visibleCount}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mt-12 w-full max-w-[1650px] px-0 sm:px-6 md:mt-20 lg:px-8"
        >
          <div className="rounded-[20px] bg-[#272927] px-6 py-5 sm:px-8 md:px-10 md:py-6 lg:px-12">
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-0">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`flex items-center gap-3.5 lg:px-6 ${
                    index < features.length - 1 ? 'lg:border-r lg:border-white/10' : ''
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                    <feature.icon size={20} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white md:text-base">{feature.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-white/50 md:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
