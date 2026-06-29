import mongoose from 'mongoose'
import { PLAN_IDS } from '../constants/pricing.js'

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    plan: { type: String, enum: PLAN_IDS, required: true },
    amount: { type: Number, required: true },
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

paymentSchema.index({ razorpayOrderId: 1 })
paymentSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Payment', paymentSchema)
