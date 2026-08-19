import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import HomePricingCard from './HomePricingCard'
import { usePlans } from '../../hooks/useCatalog'
import { fadeUp, staggerContainer } from '../../utils/animations'

export default function Pricing() {
  const { data: plans = [] } = usePlans()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const selected = plans.find((p) => p.id === selectedPlan) || plans.find((p) => p.popular) || plans[0]

  const activeId = selected?.id || selectedPlan

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
          className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
        >
          <span className="inline-flex rounded-full border border-black/10 bg-[#f5f5f5] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">
            Pricing
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black leading-[1.12] md:text-3xl lg:text-[2.125rem]">
            Plans that fit.{' '}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              One for every need.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-black/50 md:text-base">
            Choose a plan that fits your question. Some let you pick a mentor; others we assign for you.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto flex max-w-[1100px] flex-col items-center gap-4 md:flex-row md:flex-wrap md:items-stretch md:justify-center md:gap-5"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              custom={index * 0.1}
              className="w-full max-w-full flex-1 sm:max-w-[300px] md:max-w-[310px]"
            >
              <HomePricingCard
                plan={plan}
                selected={activeId === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 flex max-w-[980px] flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <p className="text-center text-sm text-black/50 sm:text-left">
              Selected:{' '}
              <span className="font-semibold text-black">
                {selected ? `${selected.name} — ₹${selected.price}` : 'Choose a plan'}
              </span>
            </p>
            <Link
              to={selected ? `/signup?plan=${selected.id}` : '/signup'}
              className="inline-flex min-h-12 w-full max-w-[300px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-[0_8px_24px_rgba(139,92,246,0.35)] sm:w-auto"
            >
              Continue with {selected?.name || 'a plan'}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
