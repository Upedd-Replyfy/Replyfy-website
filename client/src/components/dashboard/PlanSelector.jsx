import { motion } from 'framer-motion'
import { planListFrom } from '../../constants'
import PlanCard from '../pricing/PlanCard'
import { useDashboardTheme } from '../../context/DashboardThemeContext'

export default function PlanSelector({ plan, plans, onSelect, onContinue }) {
  const { isDark } = useDashboardTheme()
  const list = planListFrom(plans)
  const hasAuto = list.some((p) => !p.requiresExpertSelection)
  const hasPick = list.some((p) => p.requiresExpertSelection)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Choose your plan</h2>
      <p className="mt-2 text-sm text-muted">
        {hasAuto && hasPick
          ? 'Some plans auto-assign a mentor. Others let you pick who answers.'
          : 'Choose the plan that fits your question.'}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
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
