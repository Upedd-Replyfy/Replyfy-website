import mongoose from 'mongoose'

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['processed', 'ignored', 'failed'],
      default: 'processed',
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

export default mongoose.model('WebhookEvent', webhookEventSchema)
