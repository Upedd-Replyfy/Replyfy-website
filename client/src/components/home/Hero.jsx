import { motion } from 'framer-motion'
import { ArrowUpRight, CirclePlay } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroDashboardPreview from './HeroDashboardPreview'
import TrustBanner from './TrustBanner'
import ScrollLink from '../ui/ScrollLink'

const stats = [
  { value: '12 hrs', label: 'Avg. response time' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '50', label: 'Verified experts' },
]

const ease = [0.22, 1, 0.36, 1]

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease },
})

export default function Hero() {
  return (
    <section className="relative flex min-h-svh w-full flex-col overflow-x-hidden bg-[#1A1C1C]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 82% 45%, rgba(99,102,241,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 grid min-h-0 flex-1 w-full grid-cols-1 items-center gap-8 site-gutter-left pb-4 pt-20 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-10 lg:pb-6 lg:pt-24 lg:pr-8">
        <div className="flex w-full max-w-xl flex-col items-start justify-center pr-6 text-left sm:max-w-2xl sm:pr-8 lg:-translate-y-5 lg:max-w-[34rem] lg:pr-4">
          <motion.h1
            {...reveal(0.1)}
            className="text-balance font-light leading-[1.18] tracking-[-0.02em] text-white"
            style={{ fontSize: 'clamp(1.875rem, 3.4vw, 2.875rem)' }}
          >
            Stop asking AI.
            <br />
            Ask someone who's been there.
          </motion.h1>

          <motion.p
            {...reveal(0.16)}
            className="mt-6 max-w-[38ch] font-light leading-relaxed text-white"
            style={{ fontSize: 'clamp(0.9375rem, 1.15vw, 1.125rem)' }}
          >
            Submit your question and get personalized answers from verified founders, mentors, and
            professionals.
          </motion.p>

          <motion.div
            {...reveal(0.22)}
            className="mt-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-[#1A1C1C] transition hover:bg-white/90"
            >
              Ask your first question
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <ScrollLink
              to="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-base font-normal text-white transition hover:text-white/90"
            >
              See how it works
              <CirclePlay size={14} className="text-white" />
            </ScrollLink>
          </motion.div>

          <motion.div
            {...reveal(0.28)}
            className="mt-10 flex w-full max-w-md justify-start gap-6 border-t border-white/20 pt-8 sm:gap-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="font-display text-xl font-normal tracking-tight text-white lg:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-light leading-snug text-white lg:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative flex h-[min(70vh,560px)] w-full min-h-[360px] items-center justify-center overflow-visible sm:min-h-[400px] lg:h-[min(68vh,620px)] lg:min-h-0">
          <HeroDashboardPreview />
        </div>
      </div>

      <TrustBanner className="relative z-20 shrink-0" />
    </section>
  )
}
