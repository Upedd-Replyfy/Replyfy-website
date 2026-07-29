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
    couponUsageCounted: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    verifiedVia: {
      type: String,
      enum: ['client_verify', 'webhook', 'dev', ''],
      default: '',
    },
    paidAt: { type: Date },
    sideEffectsCompleted: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true })
paymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true })
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ question: 1, status: 1 })

export default mongoose.model('Payment', paymentSchema)
