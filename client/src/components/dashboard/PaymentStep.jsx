import { motion } from 'framer-motion'
import { PLANS } from '../../constants'

export default function PaymentStep({ plan, category, expertType, selectedExpert, paying, onPay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Review & pay</h2>
      <p className="mt-2 text-sm text-muted">
        Your question will be submitted for admin review after payment.
      </p>

      <div className="luxury-card mt-8 overflow-hidden">
        <div className="border-b border-border bg-surface px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-light">
            Order summary
          </p>
        </div>
        <div className="space-y-4 p-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Plan</span>
            <span className="font-medium text-ink">{PLANS[plan].name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Category</span>
            <span className="font-medium text-ink">{category?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Expert type</span>
            <span className="font-medium text-ink">{expertType?.name}</span>
          </div>
          {plan === 'premium' && selectedExpert && (
            <div className="flex justify-between">
              <span className="text-muted">Expert</span>
              <span className="font-medium text-ink">{selectedExpert.name}</span>
            </div>
          )}
          {plan === 'standard' && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs text-muted-light">
              An available expert will be auto-assigned after admin approval.
            </p>
          )}
          <div className="flex justify-between border-t border-border pt-4">
            <span className="font-medium text-ink">Total</span>
            <span className="text-2xl font-bold text-ink">₹{PLANS[plan].price}</span>
          </div>
        </div>
        <div className="border-t border-border p-6">
          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="btn-primary w-full rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50"
          >
            {paying ? 'Processing...' : 'Pay & Submit Question'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
