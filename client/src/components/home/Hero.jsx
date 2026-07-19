import { motion } from 'framer-motion'
import { ArrowUpRight, CirclePlay } from 'lucide-react'
import HeroDashboardPreview from './HeroDashboardPreview'
import TrustBanner from './TrustBanner'
import ScrollLink from '../ui/ScrollLink'

const stats = [
  { value: '12 hrs', label: 'Avg. response' },
  { value: '98%', label: 'Satisfaction' },
  { value: '50', label: 'Mentors' },
]

const ease = [0.22, 1, 0.36, 1]

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease },
})

export default function Hero({ onAuthOpen }) {
  return (
    <section className="relative flex min-h-svh w-full flex-col overflow-x-hidden touch-pan-y bg-[#171818]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 82% 45%, rgba(12, 16, 234, 0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.06) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col site-gutter-left pb-2 pt-[5.5rem] sm:pt-24 lg:grid lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:items-center lg:gap-10 lg:pb-6 lg:pt-28 lg:pr-8">
        <div className="flex w-full max-w-xl shrink-0 flex-col items-start pr-4 text-left sm:max-w-2xl sm:pr-8 lg:-translate-y-5 lg:max-w-[34rem] lg:justify-center lg:pr-4">
          <motion.h1
            {...reveal(0.1)}
            className="mt-4 text-balance text-[2.35rem] font-light leading-[1.12] tracking-[-0.02em] text-white sm:mt-6 sm:text-5xl md:text-6xl lg:mt-0 lg:text-[clamp(2.25rem,3.6vw,3.25rem)]"
          >
            AI Gives Answers.
            <br />
            Humans Give
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              Experience.
            </span>
          </motion.h1>

          <motion.p
            {...reveal(0.16)}
            className="mt-2.5 max-w-[40ch] text-sm font-light leading-relaxed text-white/90 sm:mt-6 sm:text-lg lg:max-w-[38ch] lg:text-[clamp(0.9375rem,1.15vw,1.125rem)]"
          >
            Get practical, personalized replies from verified founders, mentors, CAs, and
            professionals-starting at just ₹99.
          </motion.p>

          <motion.div
            {...reveal(0.22)}
            className="mt-4 flex w-full flex-col gap-2 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <button
              type="button"
              onClick={() => onAuthOpen?.('signup')}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#272927] transition hover:bg-white/90 sm:min-h-12 sm:w-auto sm:px-6 sm:py-3.5 sm:text-base"
            >
              Ask your first question
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
            <ScrollLink
              to="/#how-it-works"
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-normal text-white transition hover:text-white/90 sm:min-h-12 sm:w-auto sm:py-3.5 sm:text-base"
            >
              See how it works
              <CirclePlay size={14} className="text-white" />
            </ScrollLink>
          </motion.div>

          <motion.div
            {...reveal(0.28)}
            className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-white/20 pt-4 sm:mt-10 sm:flex sm:max-w-md sm:justify-start sm:gap-8 sm:pt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="font-display text-base font-normal tracking-tight text-white sm:text-xl lg:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-light leading-snug text-white/75 sm:text-xs lg:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Phone — generous space below stats */}
        <div className="relative mx-auto mt-12 flex w-full flex-1 touch-pan-y items-start justify-center overflow-visible px-0 pb-8 pt-2 min-h-[min(56svh,620px)] sm:mt-14 sm:min-h-[min(58svh,640px)] lg:mx-0 lg:mt-0 lg:min-h-0 lg:h-[min(68vh,620px)] lg:items-center lg:pb-0 lg:pt-0">
          <HeroDashboardPreview />
        </div>
      </div>

      <TrustBanner className="relative z-20 shrink-0" />
    </section>
  )
}
