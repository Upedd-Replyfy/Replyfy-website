import { planRequiresExpertSelection } from '../../constants'

const STEPS = [
  { id: 'compose', label: 'Question' },
  { id: 'plan', label: 'Plan' },
  { id: 'expert', label: 'Expert' },
  { id: 'payment', label: 'Payment' },
]

export default function StepProgress({ current, plan }) {
  const visible = planRequiresExpertSelection(plan)
    ? STEPS
    : STEPS.filter((s) => s.id !== 'expert')

  const currentIndex = visible.findIndex((s) => s.id === current)

  return (
    <div className="mx-auto mb-8 flex w-full max-w-3xl items-center gap-2">
      {visible.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  done || active ? 'bg-primary text-primary-fg' : 'bg-surface text-muted-light'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide ${
                  active ? 'text-ink' : 'text-muted-light'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < visible.length - 1 && (
              <div
                className={`mb-5 h-px flex-1 ${done ? 'bg-primary' : 'bg-border'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
