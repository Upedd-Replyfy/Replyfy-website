import Coupon from '../models/Coupon.js'
import { ApiError } from '../utils/ApiError.js'
import { getPlanAmount } from '../constants/pricing.js'

const DEFAULT_COUPONS = [
  {
    code: 'REPLY10',
    description: '10% off any plan',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 50000,
  },
  {
    code: 'FLAT50',
    description: '₹50 off orders ₹199+',
    discountType: 'fixed',
    discountValue: 5000,
    minAmount: 19900,
  },
  {
    code: 'MENTOR20',
    description: '20% off Choose Mentor',
    discountType: 'percent',
    discountValue: 20,
    applicablePlans: ['mentor'],
    maxDiscount: 10000,
  },
]

export async function ensureDefaultCoupons() {
  for (const coupon of DEFAULT_COUPONS) {
    await Coupon.updateOne({ code: coupon.code }, { $setOnInsert: coupon }, { upsert: true })
  }
}

function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
}

function buildCouponLabel(coupon, discountAmount) {
  if (coupon.discountType === 'percent') {
    return `${coupon.discountValue}% off (−₹${discountAmount / 100})`
  }
  return `₹${coupon.discountValue / 100} off`
}

export async function validateCoupon({ code, plan, amountPaise }) {
  const normalized = normalizeCode(code)
  if (!normalized) throw new ApiError(400, 'Enter a coupon code')

  const coupon = await Coupon.findOne({ code: normalized, isActive: true })
  if (!coupon) throw new ApiError(400, 'Invalid coupon code')

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, 'This coupon has expired')
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit')
  }

  if (coupon.applicablePlans?.length && !coupon.applicablePlans.includes(plan)) {
    throw new ApiError(400, 'This coupon is not valid for the selected plan')
  }

  const originalAmount = amountPaise ?? getPlanAmount(plan)

  if (originalAmount < coupon.minAmount) {
    throw new ApiError(
      400,
      `Minimum order of ₹${coupon.minAmount / 100} required for this coupon`
    )
  }

  let discountAmount = 0
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round((originalAmount * coupon.discountValue) / 100)
    if (coupon.maxDiscount != null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount)
    }
  } else {
    discountAmount = coupon.discountValue
  }

  discountAmount = Math.min(discountAmount, originalAmount - 100)
  if (discountAmount <= 0) {
    throw new ApiError(400, 'This coupon cannot be applied to this order')
  }

  const finalAmount = originalAmount - discountAmount

  return {
    code: coupon.code,
    description: coupon.description,
    label: buildCouponLabel(coupon, discountAmount),
    originalAmount,
    discountAmount,
    finalAmount,
    couponId: coupon._id,
  }
}

export async function incrementCouponUsage(code) {
  const normalized = normalizeCode(code)
  if (!normalized) return
  await Coupon.updateOne({ code: normalized }, { $inc: { usedCount: 1 } })
}
