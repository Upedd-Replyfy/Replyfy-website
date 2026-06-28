import { motion } from 'framer-motion'
import { fadeUp } from '../../utils/animations'

const logos = ['Stripe', 'Notion', 'Miro', 'Ramp', 'Airbnb', 'Canva']

export default function TrustedBy() {
  return (
    <section className="relative w-full py-2">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mx-5 md:mx-8 lg:mx-12 glass-strong rounded-xl px-5 py-3 md:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted whitespace-nowrap">
            Trusted by founders &amp; teams at
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 w-full">
            {logos.map((name) => (
              <span
                key={name}
                className="text-sm md:text-base font-semibold text-ink/25 hover:text-ink/40 transition-colors tracking-tight"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
