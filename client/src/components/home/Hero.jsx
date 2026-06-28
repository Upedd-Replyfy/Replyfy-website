import { motion } from 'framer-motion'
import { ArrowRight, CirclePlay, Clock, Smile, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradientBlobs from '../ui/GradientBlobs'
import HeroOrbitVisual from './HeroOrbitVisual'
import ScrollLink from '../ui/ScrollLink'
import { fadeUp } from '../../utils/animations'

const stats = [
  { value: '48h', label: 'Avg. response time', icon: Clock },
  { value: '98%', label: 'Satisfaction rate', icon: Smile },
  { value: '120+', label: 'Verified experts', icon: ShieldCheck },
]

export default function Hero() {
  return (
    <section className="relative min-h-[560px] w-full overflow-hidden bg-canvas lg:min-h-[520px]">
      <GradientBlobs />

      <div className="page-container relative z-10 flex min-h-[560px] w-full flex-col lg:min-h-[520px] lg:flex-row">
        <div className="flex flex-1 flex-col justify-center pb-8 pt-24 lg:pb-12 lg:pt-28">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-[var(--shadow-luxury-sm)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-light opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
            <span className="text-xs font-medium text-muted">
              2,400+ questions answered this month
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.08}
            variants={fadeUp}
            className="max-w-[600px] text-5xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[4rem]"
          >
            Ask better questions.
            <br />
            Get answers from{' '}
            <span className="text-gradient">real experts.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.16}
            variants={fadeUp}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg"
          >
            No AI. No templates. Just real humans with real experience.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.24}
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/signup"
              className="btn-primary group inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-semibold"
            >
              Ask your first question
              <ArrowRight size={15} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <ScrollLink
              to="/#how-it-works"
              className="btn-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold"
            >
              See how it works
              <CirclePlay size={14} className="text-muted" />
            </ScrollLink>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.32}
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-ink shadow-[var(--shadow-luxury-sm)]">
                  <stat.icon size={16} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-xl font-semibold tracking-tight text-ink">{stat.value}</p>
                  <p className="text-xs text-muted-light">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative min-h-[340px] flex-1 lg:min-h-0">
          <HeroOrbitVisual />
        </div>
      </div>
    </section>
  )
}
