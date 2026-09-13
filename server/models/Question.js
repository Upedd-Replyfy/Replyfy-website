import mongoose from 'mongoose'

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

const availabilitySlotSchema = new mongoose.Schema(
  {
    date: Date,
    time: { type: String, default: '' },
    label: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { _id: false }
)

const questionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    expertType: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertType' },
    priority: { type: String, enum: ['standard', 'priority', 'urgent'], default: 'standard' },
    plan: { type: String, required: true, trim: true, lowercase: true },
    /** Derived from plan at create: written_answer | mentor_call */
    serviceType: {
      type: String,
      enum: ['written_answer', 'mentor_call'],
      default: 'written_answer',
      index: true,
    },
    selectedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [attachmentSchema],
    links: [{ type: String, trim: true }],
    /** Normalized E.164 WhatsApp number — required for mentor_call */
    whatsappNumber: { type: String, default: '' },
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
    /** Mentor Call admin gate (mirrors status for call workflow clarity) */
    adminApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_applicable'],
      default: 'not_applicable',
    },
    mentorRequestStatus: {
      type: String,
      enum: ['pending', 'sent', 'responded', 'not_applicable'],
      default: 'not_applicable',
    },
    meetingStatus: {
      type: String,
      enum: ['not_scheduled', 'scheduled', 'completed', 'cancelled', 'not_applicable'],
      default: 'not_applicable',
    },
    mentorAvailability: {
      slots: [availabilitySlotSchema],
      timelineNote: { type: String, default: '' },
      submittedAt: Date,
    },
    meetingDate: Date,
    meetingTime: { type: String, default: '' },
    meetingDurationMinutes: { type: Number, default: 20, min: 5, max: 180 },
    meetingLink: { type: String, default: '' },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: Date,
    emailNotificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'not_required'],
      default: 'not_required',
    },
    emailSentAt: Date,
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
    mentorPointsPaise: { type: Number, default: 0, min: 0 },
    pointsCredited: { type: Boolean, default: false },
    pointsCreditedAt: Date,
  },
  { timestamps: true }
)

questionSchema.index({ user: 1, status: 1 })
questionSchema.index({ assignedExpert: 1, status: 1 })
questionSchema.index({ status: 1, createdAt: -1 })
questionSchema.index({ serviceType: 1, meetingStatus: 1, createdAt: -1 })

export default mongoose.model('Question', questionSchema)
