import mongoose from 'mongoose'
import { PLAN_IDS } from '../constants/pricing.js'

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    name: String,
    type: { type: String, enum: ['image', 'pdf', 'document', 'other'], default: 'other' },
    bytes: Number,
  },
  { _id: true }
)

const questionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    expertType: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertType', required: true },
    priority: { type: String, enum: ['standard', 'priority', 'urgent'], default: 'standard' },
    plan: { type: String, enum: PLAN_IDS, required: true },
    selectedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: [
        'pending_payment',
        'pending_admin_review',
        'rejected',
        'assigned',
        'in_progress',
        'waiting_admin_review',
        'completed',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    rejectionReason: { type: String, default: '' },
    adminReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminReviewedAt: Date,
    assignedAt: Date,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: Date,
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, required: true },
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    isRated: { type: Boolean, default: false },
  },
  { timestamps: true }
)

questionSchema.index({ user: 1, status: 1 })
questionSchema.index({ assignedExpert: 1, status: 1 })
questionSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Question', questionSchema)
