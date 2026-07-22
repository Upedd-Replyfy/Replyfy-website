import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ExpertCarousel from './ExpertCarousel'
import { fadeUp } from '../../utils/animations'

export default function ExpertShowcase() {
  return (
    <section id="experts" className="section-spacing relative w-full border-t border-black/[0.06] bg-white">
      <div className="page-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px' }}
          variants={fadeUp}
          className="mb-12 md:mb-16"
        >
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-[#f5f5f5] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
              Mentors
            </span>

            <div className="mx-auto mt-5 max-w-2xl">
              <h2 className="text-2xl md:text-3xl lg:text-[2.125rem] font-semibold tracking-tight text-black leading-[1.12]">
                Real people.{' '}
                <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
                  Real expertise.
                </span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-black/65 leading-relaxed">
                Every mentor on Replyfy is vetted for credentials and response quality.
                You always know who answered your question.
              </p>
            </div>
          </div>
        </motion.div>

        <ExpertCarousel />

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            to="/mentors"
            className="group inline-flex items-center gap-1.5 text-base font-semibold bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent transition hover:opacity-80"
          >
            View all
            <ArrowRight
              size={16}
              className="text-violet-500 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
