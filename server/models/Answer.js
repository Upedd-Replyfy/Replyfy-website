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

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, unique: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'rejected', 'approved'],
      default: 'pending_review',
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Answer', answerSchema)
