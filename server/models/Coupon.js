import mongoose from 'mongoose'
import { PLAN_IDS } from '../constants/pricing.js'

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    applicablePlans: [{ type: String, enum: PLAN_IDS }],
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

couponSchema.index({ code: 1, isActive: 1 })

export default mongoose.model('Coupon', couponSchema)
