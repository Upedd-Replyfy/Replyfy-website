import { motion } from 'framer-motion'
import {
  MessageSquare,
  Users,
  UserCheck,
  Send,
  Shield,
  Lock,
  Zap,
  Star,
} from 'lucide-react'
import { fadeUp, staggerContainer } from '../../utils/animations'

const stepAccents = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-sky-400 to-violet-500',
]

const steps = [
  {
    icon: MessageSquare,
    label: 'Question',
    title: 'Ask your question',
    description:
      'Describe your situation in detail. The more context, the better the answer.',
    position: 'lg:col-start-1 lg:row-start-1 lg:justify-self-start',
    delay: 0,
  },
  {
    icon: Users,
    label: 'Match',
    title: 'We find your expert',
    description:
      'Our system matches you with a verified professional who has solved this before.',
    position: 'lg:col-start-1 lg:row-start-2 lg:justify-self-center',
    delay: 0.1,
  },
  {
    icon: UserCheck,
    label: 'Expert',
    title: 'Expert reviews',
    description:
      'A real human reads your question and crafts a thoughtful, personalized response.',
    position: 'lg:col-start-2 lg:row-start-1 lg:justify-self-end',
    delay: 0.2,
  },
  {
    icon: Send,
    label: 'Reply',
    title: 'You get your answer',
    description:
      'Receive a detailed reply in your dashboard — with the option to ask follow-ups.',
    position: 'lg:col-start-2 lg:row-start-2 lg:justify-self-end',
    delay: 0.3,
  },
]

const features = [
  { icon: Shield, title: 'Verified experts', description: 'Every expert is vetted for credibility.' },
  { icon: Lock, title: 'Private & secure', description: 'Your questions and data are always protected.' },
  { icon: Zap, title: 'Faster clarity', description: 'Get answers in hours, not weeks.' },
  { icon: Star, title: 'Actionable advice', description: 'Real-world insights you can actually use.' },
]

function ProcessPath() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 1000 340"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 120 70 C 220 70, 260 200, 380 210 S 580 80, 680 90 S 860 240, 920 260"
        stroke="url(#pathGrad)"
        strokeWidth="2"
        strokeDasharray="8 10"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      {[
        { cx: 250, cy: 140, color: '#38bdf8' },
        { cx: 480, cy: 145, color: '#818cf8' },
        { cx: 720, cy: 170, color: '#a78bfa' },
      ].map((node, i) => (
        <g key={i}>
          <circle cx={node.cx} cy={node.cy} r="14" fill={node.color} fillOpacity="0.15" />
          <circle cx={node.cx} cy={node.cy} r="5" fill={node.color} fillOpacity="0.85" />
        </g>
      ))}
    </svg>
  )
}

function StepCard({ step, index }) {
  const Icon = step.icon
  const accent = stepAccents[index]

  return (
    <motion.article
      variants={fadeUp}
      custom={step.delay}
      className={`relative w-full max-w-[260px] ${step.position}`}
    >
      <div className="relative rounded-[20px] border border-white/10 bg-neutral-900/90 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <span
          className={`absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-[11px] font-bold text-white shadow-md`}
        >
          {index + 1}
        </span>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
            <Icon size={22} strokeWidth={1.6} />
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {step.label}
          </span>
          <h3 className="mt-1.5 text-base font-semibold tracking-tight text-white">{step.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{step.description}</p>
        </div>
      </div>
    </motion.article>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-spacing relative w-full overflow-hidden bg-black">
      <div className="page-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 md:mb-16 max-w-lg"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
            How it works
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            From question to clarity in{' '}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              four steps
            </span>
          </h2>
          <p className="mt-4 text-base text-white/55 leading-relaxed">
            No forums. No AI slop. A direct line to someone who&apos;s been there.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative mx-auto max-w-6xl"
        >
          <ProcessPath />

          <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-x-8 lg:gap-y-2 lg:min-h-[300px] lg:items-center">
            {steps.map((step, index) => (
              <StepCard key={step.label} step={step} index={index} />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {steps.map((step, index) => (
              <StepCard key={step.label} step={{ ...step, position: '' }} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16 w-full rounded-[24px] border border-white/10 bg-white/5 px-8 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12"
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white md:h-14 md:w-14">
                  <feature.icon size={24} strokeWidth={1.6} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white md:text-base lg:text-lg">
                    {feature.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50 md:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
