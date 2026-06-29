import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CirclePlay } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroOrbitVisual from './HeroOrbitVisual'
import ScrollLink from '../ui/ScrollLink'

const avatars = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
]

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
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#050505]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 82% 45%, rgba(99,102,241,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 grid min-h-[100svh] w-full grid-cols-1 items-center gap-12 gutter-left pb-16 pt-24 lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:gap-10 lg:pb-20 lg:pt-28 lg:pr-0">
        <div className="flex w-full flex-col items-start justify-center text-left">
          <motion.div {...reveal(0.05)} className="mb-7 flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatars.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#050505]"
                  draggable={false}
                />
              ))}
            </div>
            <span className="text-[13px] text-white/45">2,400+ questions answered this month</span>
          </motion.div>

          <motion.h1
            {...reveal(0.1)}
            className="font-semibold leading-[1.08] tracking-[-0.025em] text-white"
            style={{ fontSize: 'clamp(2.25rem, 4.2vw, 4rem)', maxWidth: '14ch' }}
          >
            Ask anything.
            <br />
            Get real answers
            <br />
            <span className="text-white/65">from real experts.</span>
          </motion.h1>

          <motion.p
            {...reveal(0.16)}
            className="mt-6 leading-relaxed text-white/50"
            style={{ fontSize: 'clamp(1rem, 1.15vw, 1.25rem)', maxWidth: '42ch' }}
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
            className="mt-10 flex w-full max-w-md justify-start gap-8 border-t border-white/[0.07] pt-8 sm:gap-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-xl font-semibold tracking-tight text-white lg:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-white/40 lg:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative h-[340px] w-full sm:h-[380px] lg:h-[min(66vh,580px)] lg:-mr-[4vw]">
          <HeroOrbitVisual mouse={mouse} />
        </div>
      </div>
    </section>
  )
}
