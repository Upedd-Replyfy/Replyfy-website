import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SectionHeader from '../ui/SectionHeader'
import PlanCard from '../pricing/PlanCard'
import { PLANS } from '../../constants'
import { fadeUp, staggerContainer } from '../../utils/animations'

export default function Pricing() {
  return (
    <section id="pricing" className="section-spacing relative w-full overflow-hidden border-t border-white/10 bg-black">
      <div className="page-container">
        <SectionHeader
          eyebrow="Pricing"
          title="Three tiers."
          highlight="One for every need."
          className="mb-12 md:mb-16"
          align="left"
          dark
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid w-full gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {Object.values(PLANS).map((plan, index) => (
            <motion.div key={plan.id} variants={fadeUp} custom={index * 0.1} className="flex flex-col">
              <PlanCard plan={plan} dark className="h-full" />
              <Link
                to="/signup"
                className={`mt-5 w-full rounded-2xl py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                }`}
              >
                Get started
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
