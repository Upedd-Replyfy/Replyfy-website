import { motion } from 'framer-motion'
import { Check, Zap, Crown } from 'lucide-react'
import { PLANS } from '../../constants'

const icons = { standard: Zap, premium: Crown }

export default function PlanSelector({ plan, onSelect, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Choose your plan</h2>
      <p className="mt-2 text-sm text-muted">
        Standard assigns an expert automatically. Premium lets you pick your expert.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {Object.values(PLANS).map((p) => {
          const Icon = icons[p.id]
          const active = plan === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`relative rounded-2xl border p-6 text-left transition-all ${
                active
                  ? 'border-ink bg-ink text-white shadow-[var(--shadow-luxury-lg)]'
                  : 'border-border bg-card hover:border-charcoal/30 hover:shadow-[var(--shadow-luxury-sm)]'
              }`}
            >
              {p.id === 'premium' && (
                <span
                  className={`absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    active ? 'bg-white text-ink' : 'bg-ink text-white'
                  }`}
                >
                  Recommended
                </span>
              )}
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? 'bg-white/15' : 'bg-surface text-ink'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className={`text-lg font-semibold ${active ? 'text-white' : 'text-ink'}`}>
                    {p.name}
                  </p>
                  <p className={`text-xs ${active ? 'text-white/70' : 'text-muted-light'}`}>
                    {p.tagline}
                  </p>
                </div>
              </div>
              <p className={`mt-4 text-3xl font-bold ${active ? 'text-white' : 'text-ink'}`}>
                ₹{p.price}
              </p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      active ? 'text-white/90' : 'text-muted'
                    }`}
                  >
                    <Check size={14} className={`mt-0.5 shrink-0 ${active ? 'text-white' : 'text-ink'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <p className={`mt-4 text-xs leading-relaxed ${active ? 'text-white/60' : 'text-muted-light'}`}>
                {p.note}
              </p>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn-primary mt-8 w-full rounded-2xl py-3.5 text-sm font-semibold sm:w-auto sm:px-8"
      >
        Continue
      </button>
    </motion.div>
  )
}
