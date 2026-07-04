import { motion } from 'framer-motion'
import { ArrowUpRight, CirclePlay } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroDashboardPreview from './HeroDashboardPreview'
import TrustBanner from './TrustBanner'
import ScrollLink from '../ui/ScrollLink'

const stats = [
  { value: '48h', label: 'Avg. response time' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '120+', label: 'Verified experts' },
]

const ease = [0.22, 1, 0.36, 1]

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease },
})

export default function Hero() {
  return (
    <section className="relative flex min-h-svh w-full flex-col overflow-x-hidden bg-[#050505]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 82% 45%, rgba(99,102,241,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 grid min-h-0 flex-1 w-full grid-cols-1 items-center gap-8 gutter-left pb-4 pt-20 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-10 lg:pb-6 lg:pt-24 lg:pr-8">
        <div className="flex w-full flex-col items-start justify-center text-left lg:-translate-y-5">
          <motion.h1
            {...reveal(0.1)}
            className="font-semibold leading-[1.1] tracking-[-0.025em] text-white"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.125rem)', maxWidth: '14ch' }}
          >
            Ask anything.
            <br />
            Get real answers
            <br />
            <span className="text-white/65">from real experts.</span>
          </motion.h1>

          <motion.p
            {...reveal(0.16)}
            className="mt-5 leading-relaxed text-white/50"
            style={{ fontSize: 'clamp(0.8125rem, 0.9vw, 0.9375rem)', maxWidth: '42ch' }}
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
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#050505] transition hover:bg-white/90"
            >
              Ask your first question
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <ScrollLink
              to="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white/60 transition hover:text-white"
            >
              See how it works
              <CirclePlay size={14} className="text-white/35" />
            </ScrollLink>
          </motion.div>

          <motion.div
            {...reveal(0.28)}
            className="mt-10 flex w-full max-w-md justify-start gap-8 border-t border-white/20 pt-8 sm:gap-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-white lg:text-xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-white/40 lg:text-xs">
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
