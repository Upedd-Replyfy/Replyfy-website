import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../ui/SectionHeader'
import { fadeUp, staggerContainer } from '../../utils/animations'

const plans = [
  {
    name: 'Standard',
    price: '₹499',
    description: 'Clear, direct answers for straightforward questions.',
    features: ['One expert response', '48-hour delivery', 'Email notification', 'Follow-up clarification'],
    highlighted: false,
  },
  {
    name: 'Priority',
    price: '₹999',
    description: 'Faster turnaround with deeper analysis when timing matters.',
    features: [
      'Priority queue',
      '24-hour delivery',
      'Detailed written response',
      'One revision included',
      'Category-matched expert',
    ],
    highlighted: true,
  },
  {
    name: 'Consultation',
    price: '₹2,499',
    description: 'Complex decisions deserve a thorough expert review.',
    features: [
      'Senior expert assignment',
      '12-hour delivery',
      'Structured breakdown',
      'Two revisions included',
      'Resource recommendations',
    ],
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section-spacing relative w-full overflow-hidden bg-surface">
      <div className="page-container">
        <SectionHeader
          eyebrow="Pricing"
          title="Pay per question."
          highlight="Nothing else."
          description="One payment, one answer. No subscriptions, no credits that expire."
          className="mx-auto mb-12 md:mb-16"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              custom={index * 0.1}
              whileHover={{ y: plan.highlighted ? 0 : -4 }}
              className={`relative flex flex-col rounded-[20px] p-8 ${
                plan.highlighted
                  ? 'priority-selected border-transparent'
                  : 'luxury-card'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink shadow-[var(--shadow-luxury-sm)]">
                  Most popular
                </span>
              )}
              <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-4xl font-semibold tracking-tight ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-muted-light'}`}>
                  / question
                </span>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${plan.highlighted ? 'text-white/75' : 'text-muted'}`}>
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2.5 text-sm ${plan.highlighted ? 'text-white/90' : 'text-ink'}`}
                  >
                    <Check size={15} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-white' : 'text-ink'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`mt-8 w-full rounded-2xl py-3 text-center text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-card text-ink hover:bg-surface'
                    : 'btn-secondary'
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
