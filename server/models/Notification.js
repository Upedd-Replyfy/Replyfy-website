import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'payment_success',
        'question_submitted',
        'question_approved',
        'question_rejected',
        'expert_assigned',
        'deadline_reminder',
        'answer_submitted',
        'answer_approved',
        'answer_rejected',
        'answer_delivered',
        'rating_reminder',
        'wallet_credited',
        'withdraw_approved',
        'withdraw_rejected',
        'general',
      ],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
