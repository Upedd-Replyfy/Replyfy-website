import { motion } from 'framer-motion'
import {
  MessageSquare,
  Users,
  UserCheck,
  Send,
  Shield,
  Zap,
  Star,
} from 'lucide-react'
import { fadeUp, staggerContainer } from '../../utils/animations'

const steps = [
  {
    icon: MessageSquare,
    title: 'Ask your question',
    description:
      'Describe your situation in detail. The more context, the better the answer.',
    delay: 0,
  },
  {
    icon: Users,
    title: 'We match a mentor',
    description:
      'Our system matches you with a verified mentor who has solved this before.',
    delay: 0.08,
  },
  {
    icon: UserCheck,
    title: 'Mentor reviews',
    description:
      'A real human reviews your question and crafts a thoughtful, personalized response.',
    delay: 0.16,
  },
  {
    icon: Send,
    title: 'Receive your answer',
    description:
      'Get a detailed answer in your dashboard with the option to ask follow-ups.',
    delay: 0.24,
  },
]

const features = [
  { icon: Shield, title: 'Verified mentors', description: 'Every mentor is vetted for credibility.' },
  { icon: Zap, title: 'Faster clarity', description: 'Get answers in hours, not weeks.' },
  { icon: Star, title: 'Actionable advice', description: 'Real-world insights you can actually use.' },
]

function StepConnector() {
  return (
    <div
      className="pointer-events-none absolute inset-x-[0.5%] top-[80px] hidden lg:block"
      aria-hidden
    >
      <div className="relative h-px w-full">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-black/20" />
        {[16.66, 50, 83.33].map((left) => (
          <span
            key={left}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
            style={{ left: `${left}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function StepCard({ step, index }) {
  const Icon = step.icon
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.article variants={fadeUp} custom={step.delay} className="relative z-10 h-full">
      <div className="flex h-full min-h-[200px] flex-col items-center rounded-[20px] border border-black/[0.07] bg-white px-5 py-6 text-center shadow-[0_12px_48px_rgba(0,0,0,0.07)] sm:px-7 md:min-h-[230px] md:px-10 md:py-7 lg:min-h-[240px] lg:px-11">
        <span className="text-sm font-medium tracking-widest text-black/35">{num}</span>

        <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.04] text-black">
          <Icon size={26} strokeWidth={1.4} />
        </div>

        <h3 className="mt-4 text-base font-semibold tracking-tight text-black md:text-lg">{step.title}</h3>
        <p className="mt-2 max-w-[312px] text-sm leading-relaxed text-black/50 md:text-[15px]">
          {step.description}
        </p>
      </div>
    </motion.article>
  )
}

export default function HowItWorks() {
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative mx-auto w-full max-w-[1650px] px-0 sm:px-6 lg:px-8"
        >
          <StepConnector />

          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10 xl:gap-12">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </motion.div>

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
