import { motion } from 'framer-motion'
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
          className="mx-auto mb-12 md:mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-black/10 bg-[#f5f5f5] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
            Experts
          </span>
          <h2 className="mt-5 text-2xl md:text-3xl lg:text-[2.125rem] font-semibold tracking-tight text-black leading-[1.12]">
            Real people.{' '}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              Real expertise.
            </span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-black/65 leading-relaxed">
            Every expert on Replyfy is vetted for credentials and response quality.
            You always know who answered your question.
          </p>
        </motion.div>

        <ExpertCarousel />
      </div>
    </section>
  )
}
