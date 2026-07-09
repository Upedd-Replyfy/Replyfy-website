import { Check, Zap, Crown, Phone } from 'lucide-react'

const icons = {
  basic: Zap,
  mentor: Crown,
  expert_call: Phone,
}

export default function PlanCard({ plan, active = false, onClick, className = '', dark = false }) {
  const Icon = icons[plan.id]
  const Tag = onClick ? 'button' : 'div'
  const isPopular = plan.popular

  const inactiveClass = dark
    ? 'border-white/10 bg-neutral-900 hover:border-white/20'
    : 'border-border bg-card hover:border-charcoal/30 hover:shadow-[var(--shadow-luxury-sm)]'

  const activeClass = dark
    ? 'border-white bg-white text-black shadow-[var(--shadow-luxury-lg)]'
    : 'border-primary bg-primary text-primary-fg shadow-[var(--shadow-luxury-lg)]'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border p-6 text-left transition-all md:p-7 ${
        active ? activeClass : inactiveClass
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {isPopular && (
        <span
          className={`absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            active
              ? dark
                ? 'bg-[#1A1C1C] text-white'
                : 'bg-white text-ink'
              : dark
                ? 'bg-gradient-to-r from-sky-400 to-violet-400 text-white'
                : 'bg-primary text-primary-fg'
          }`}
        >
          Most popular
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? dark
                ? 'bg-black/10 text-black'
                : 'bg-white/15 text-white'
              : dark
                ? 'bg-white/10 text-white'
                : 'bg-surface text-ink'
          }`}
        >
          {Icon && <Icon size={18} />}
        </span>
        <div>
          <p
            className={`text-lg font-semibold ${
              active ? (dark ? 'text-black' : 'text-white') : dark ? 'text-white' : 'text-ink'
            }`}
          >
            {plan.name}
          </p>
          {plan.tagline && (
            <p
              className={`text-xs ${
                active
                  ? dark
                    ? 'text-black/60'
                    : 'text-white/70'
                  : dark
                    ? 'text-white/50'
                    : 'text-muted-light'
              }`}
            >
              {plan.tagline}
            </p>
          )}
        </div>
      </div>
      <p
        className={`mt-5 border-b pb-5 text-3xl font-bold ${
          active
            ? dark
              ? 'border-black/10 text-black'
              : 'border-white/20 text-white'
            : dark
              ? 'border-white/10 text-white'
              : 'border-border text-ink'
        }`}
      >
        ₹{plan.price}
      </p>
      <ul className="mt-5 space-y-2.5">
        {plan.features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm ${
              active
                ? dark
                  ? 'text-black/80'
                  : 'text-white/90'
                : dark
                  ? 'text-white/70'
                  : 'text-muted'
            }`}
          >
            <Check
              size={14}
              className={`mt-0.5 shrink-0 ${
                active
                  ? dark
                    ? 'text-black'
                    : 'text-white'
                  : dark
                    ? 'text-sky-400'
                    : 'text-ink'
              }`}
            />
            {f}
          </li>
        ))}
      </ul>
    </Tag>
  )
}
