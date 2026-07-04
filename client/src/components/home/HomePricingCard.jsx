import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Phone } from 'lucide-react'

const icons = {
  basic: Zap,
  mentor: Crown,
  expert_call: Phone,
}

export default function HomePricingCard({ plan, selected = false, onSelect }) {
  const Icon = icons[plan.id]
  const isPopular = plan.popular

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      layout
      initial={false}
      animate={{
        y: selected ? -8 : 0,
        scale: selected ? 1.03 : 1,
      }}
      whileHover={{
        y: selected ? -10 : -6,
        scale: selected ? 1.04 : 1.02,
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`relative flex h-full w-full cursor-pointer flex-col rounded-[20px] border bg-white p-6 text-black outline-none md:p-7 ${
        selected
          ? 'border-2 border-black shadow-[0_20px_56px_rgba(0,0,0,0.14)]'
          : isPopular
            ? 'border-black/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-black/25'
            : 'border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-black/20 hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)]'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          Most popular
        </span>
      )}

      <motion.span
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          scale: selected ? 1 : 0.6,
        }}
        className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"
        aria-hidden={!selected}
      >
        <Check size={13} strokeWidth={2.5} />
      </motion.span>

      <div className="flex items-center gap-3">
        <motion.span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05] text-black"
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(0,0,0,0.08)' }}
          transition={{ duration: 0.2 }}
        >
          {Icon && <Icon size={18} strokeWidth={1.5} />}
        </motion.span>
        <div>
          <p className="text-base font-semibold">{plan.name}</p>
          {plan.tagline && <p className="text-xs text-black/50">{plan.tagline}</p>}
        </div>
      </div>

      <p className="mt-5 border-b border-black/10 pb-5 text-2xl font-bold text-black">
        ₹{plan.price}
      </p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature, index) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="flex items-start gap-2 text-sm text-black/65"
          >
            <Check size={14} className="mt-0.5 shrink-0 text-black" strokeWidth={2} />
            {feature}
          </motion.li>
        ))}
      </ul>

      <Link
        to={`/signup?plan=${plan.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`mt-7 w-full rounded-2xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
          selected
            ? 'bg-black text-white hover:bg-black/90'
            : 'border border-black/20 text-black hover:border-black/40 hover:bg-black/[0.03]'
        }`}
      >
        Get started
      </Link>
    </motion.article>
  )
}
