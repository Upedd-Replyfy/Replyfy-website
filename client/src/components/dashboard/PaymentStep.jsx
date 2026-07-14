import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PLANS, planRequiresExpertSelection } from '../../constants'
import { userApi } from '../../services/api'

import { formatRupeeAmount } from '../../utils/currency'

export default function PaymentStep({
  plan,
  category,
  expertType,
  selectedExpert,
  paying,
  appliedCoupon,
  onCouponChange,
  onPay,
}) {
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)

  const originalAmount = PLANS[plan].pricePaise
  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const finalAmount = appliedCoupon?.finalAmount ?? originalAmount

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return toast.error('Enter a coupon code')

    setApplying(true)
    try {
      const { coupon } = await userApi.validateCoupon({ code, plan })
      onCouponChange(coupon)
      toast.success('Coupon applied')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setApplying(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponChange(null)
    setCouponInput('')
  }

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
            <span className="text-muted">Mentor type</span>
            <span className="font-medium text-ink">{expertType?.name}</span>
          </div>
          {planRequiresExpertSelection(plan) && selectedExpert && (
            <div className="flex justify-between">
              <span className="text-muted">Mentor</span>
              <span className="font-medium text-ink">{selectedExpert.name}</span>
            </div>
          )}
          {plan === 'basic' && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs text-muted-light">
              We&apos;ll choose the best available mentor after admin approval.
            </p>
          )}
          {plan === 'expert_call' && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs text-muted-light">
              Includes a 20-minute live call with your chosen mentor.
            </p>
          )}

          <div className="border-t border-border pt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag size={14} className="shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="font-medium text-emerald-300">{appliedCoupon.code}</p>
                    <p className="truncate text-xs text-emerald-400/80">{appliedCoupon.label}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={paying}
                  className="shrink-0 rounded-lg p-1.5 text-emerald-400/80 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50"
                  aria-label="Remove coupon"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Coupon code"
                  disabled={paying || applying}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink uppercase placeholder:normal-case placeholder:text-muted-light focus:border-charcoal focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={paying || applying || !couponInput.trim()}
                  className="shrink-0 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-50"
                >
                  {applying ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium text-ink">₹{formatRupeeAmount(originalAmount)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span className="font-medium">−₹{formatRupeeAmount(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="font-medium text-ink">Total</span>
              <span className="text-2xl font-bold text-ink">₹{formatRupeeAmount(finalAmount)}</span>
            </div>
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
