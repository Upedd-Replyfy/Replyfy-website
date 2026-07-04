import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import HomePricingCard from './HomePricingCard'
import { PLANS } from '../../constants'
import { fadeUp, staggerContainer } from '../../utils/animations'

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState('mentor')
  const selected = PLANS[selectedPlan]

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden border-t border-black/[0.06] bg-white py-14 md:py-16 lg:py-20"
    >
      <div className="page-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mb-10 max-w-3xl md:mb-12"
        >
          <span className="inline-flex rounded-full border border-black/10 bg-[#f5f5f5] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">
            Pricing
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black leading-[1.12] md:text-3xl lg:text-[2.125rem]">
            Three tiers.{' '}
            <span className="text-black">One for every need.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/50 md:text-base">
            Basic auto-assigns an expert. Choose Mentor or Expert Call to pick your expert.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto flex max-w-[980px] flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center md:gap-5"
        >
          {Object.values(PLANS).map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              custom={index * 0.1}
              className="w-full max-w-[300px] flex-1 md:max-w-[310px]"
            >
              <HomePricingCard
                plan={plan}
                selected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 flex max-w-[980px] flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <p className="text-center text-sm text-black/50 sm:text-left">
              Selected:{' '}
              <span className="font-semibold text-black">
                {selected.name} — ₹{selected.price}
              </span>
            </p>
            <Link
              to={`/signup?plan=${selectedPlan}`}
              className="rounded-2xl bg-black px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-black/90 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
            >
              Continue with {selected.name}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
