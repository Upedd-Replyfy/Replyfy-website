import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, X, Loader2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  isMentorCallPlan,
  MENTOR_CALL_DURATION_MINUTES,
  planRequiresExpertSelection,
  resolvePlan,
} from '../../constants'
import { userApi } from '../../services/api'
import { formatRupeeAmount } from '../../utils/currency'
import { normalizeWhatsAppNumberClient } from '../../utils/phone'

export default function PaymentStep({
  plan,
  plans,
  category,
  expertType,
  mentorTypesEnabled = true,
  selectedExpert,
  paying,
  appliedCoupon,
  onCouponChange,
  onPay,
  whatsappLocal = '',
  onWhatsappLocalChange,
  whatsappCountryCode = '+91',
  onWhatsappCountryCodeChange,
}) {
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [whatsappError, setWhatsappError] = useState('')

  const selected = resolvePlan(plan, plans)
  const originalAmount = selected?.pricePaise || 0
  const needsMentor = planRequiresExpertSelection(plan, plans)
  const mentorCall = isMentorCallPlan(plan, plans)
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

  const handlePayClick = () => {
    if (mentorCall) {
      const full = `${whatsappCountryCode || '+91'}${String(whatsappLocal || '').replace(/\D/g, '')}`
      const result = normalizeWhatsAppNumberClient(full)
      if (!result.ok) {
        setWhatsappError(result.error)
        toast.error(result.error)
        return
      }
      setWhatsappError('')
      onPay?.(result.value)
      return
    }
    onPay?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      <h2 className="text-2xl font-semibold text-ink">Review & pay</h2>
      <p className="mt-2 text-sm text-muted">
        {mentorCall
          ? 'Your mentor call request will be reviewed by our team after payment. Meeting time is scheduled by admin — you do not pick a slot here.'
          : 'Your question will be submitted for admin review after payment.'}
      </p>

      {mentorCall ? (
        <div className="mt-6 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Phone size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Mentor Call — ₹{formatRupeeAmount(originalAmount)}</p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                <li>{MENTOR_CALL_DURATION_MINUTES}-minute live call with mentor</li>
                <li>Deep personalised guidance</li>
                <li>Mentor chosen according to your selection / assignment workflow</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="luxury-card mt-8 overflow-hidden">
        <div className="border-b border-border bg-surface px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-light">
            Order summary
          </p>
        </div>
        <div className="space-y-4 p-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Plan</span>
            <span className="font-medium text-ink">{selected?.name || plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Category</span>
            <span className="font-medium text-ink">{category?.name}</span>
          </div>
          {mentorTypesEnabled ? (
            <div className="flex justify-between">
              <span className="text-muted">Mentor type</span>
              <span className="font-medium text-ink">{expertType?.name || 'Any'}</span>
            </div>
          ) : null}
          {needsMentor && selectedExpert && (
            <div className="flex justify-between">
              <span className="text-muted">Mentor</span>
              <span className="font-medium text-ink">{selectedExpert.name}</span>
            </div>
          )}
          {!needsMentor && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs text-muted-light">
              We&apos;ll choose the best available mentor after admin approval.
            </p>
          )}

          {mentorCall ? (
            <div className="rounded-xl border border-border bg-surface/60 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light">
                WhatsApp number <span className="text-rose-400">*</span>
              </label>
              <p className="mt-1 text-xs text-muted">
                Required for Mentor Call. Our team uses this number to contact you manually.
              </p>
              <div className="mt-3 flex gap-2">
                <select
                  value={whatsappCountryCode}
                  onChange={(e) => onWhatsappCountryCodeChange?.(e.target.value)}
                  disabled={paying}
                  className="h-11 w-[96px] shrink-0 rounded-xl border border-border bg-card px-2 text-sm text-ink outline-none focus:border-charcoal disabled:opacity-50"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+971">+971</option>
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={whatsappLocal}
                  onChange={(e) => {
                    onWhatsappLocalChange?.(e.target.value.replace(/[^\d]/g, '').slice(0, 12))
                    setWhatsappError('')
                  }}
                  placeholder="9876543210"
                  disabled={paying}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-ink placeholder:text-muted-light outline-none focus:border-charcoal disabled:opacity-50"
                />
              </div>
              {whatsappError ? (
                <p className="mt-2 text-xs text-rose-400">{whatsappError}</p>
              ) : (
                <p className="mt-2 text-[11px] text-muted-light">
                  Example: Country +91 · Number 9876543210 → stored as +919876543210
                </p>
              )}
            </div>
          ) : null}

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
            onClick={handlePayClick}
            disabled={paying}
            className="btn-primary w-full rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50"
          >
            {paying
              ? 'Processing...'
              : mentorCall
                ? 'Pay & Submit Mentor Call'
                : 'Pay & Submit Question'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
