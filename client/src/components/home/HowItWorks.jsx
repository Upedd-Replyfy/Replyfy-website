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
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a3a3a3" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#737373" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#d4d4d4" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[
        { cx: 250, cy: 140, color: '#525252' },
        { cx: 480, cy: 145, color: '#737373' },
        { cx: 720, cy: 170, color: '#a3a3a3' },
      ].map((node, i) => (
        <g key={i}>
          <circle cx={node.cx} cy={node.cy} r="14" fill={node.color} fillOpacity="0.12" />
          <circle cx={node.cx} cy={node.cy} r="5" fill={node.color} fillOpacity="0.7" />
        </g>
      ))}
    </svg>
  )
}

function StepCard({ step, index }) {
  const Icon = step.icon

  return (
    <motion.article
      variants={fadeUp}
      custom={step.delay}
      className={`relative w-full max-w-[260px] ${step.position}`}
    >
      <div className="relative rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-luxury-md)]">
        <span className="absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white shadow-md shadow-black/10">
          {index + 1}
        </span>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink ring-1 ring-border">
            <Icon size={22} strokeWidth={1.6} />
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
            {step.label}
          </span>
          <h3 className="mt-1.5 text-base font-semibold tracking-tight text-ink">{step.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">{step.description}</p>
        </div>
      </div>
    </motion.article>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-spacing relative w-full overflow-hidden">
      <div className="page-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 md:mb-16 max-w-lg"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-light">
            How it works
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.08]">
            From question to clarity in{' '}
            <span className="text-gradient">four steps</span>
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed">
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
          className="mx-auto mt-12 max-w-6xl luxury-card px-6 py-6 md:px-8"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink">
                  <feature.icon size={17} strokeWidth={1.6} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ink">{feature.title}</h4>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
