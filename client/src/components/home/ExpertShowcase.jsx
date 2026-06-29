import { motion } from 'framer-motion'
import ExpertCarousel from './ExpertCarousel'
import { fadeUp } from '../../utils/animations'

export default function ExpertShowcase() {
  return (
    <section id="experts" className="section-spacing relative w-full border-t border-white/10 bg-black">
      <div className="page-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px' }}
          variants={fadeUp}
          className="mx-auto mb-12 md:mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Experts
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            Real people.{' '}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              Real expertise.
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/55 leading-relaxed">
            Every expert on Replyfy is vetted for credentials and response quality.
            You always know who answered your question.
          </p>
        </motion.div>

        <ExpertCarousel dark />
      </div>
    </section>
  )
}
