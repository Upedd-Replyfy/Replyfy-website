import { motion } from 'framer-motion'
import { PLANS } from '../../constants'
import PlanCard from '../pricing/PlanCard'
import { useDashboardTheme } from '../../context/DashboardThemeContext'

export default function PlanSelector({ plan, onSelect, onContinue }) {
  const { isDark } = useDashboardTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Choose your plan</h2>
      <p className="mt-2 text-sm text-muted">
        Basic auto-assigns an expert. Choose Mentor or Expert Call to pick your expert.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {Object.values(PLANS).map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            dark={isDark}
            active={plan === p.id}
            onClick={() => onSelect(p.id)}
          />
        ))}
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
