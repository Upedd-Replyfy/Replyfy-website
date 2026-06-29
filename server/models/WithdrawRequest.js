import mongoose from 'mongoose'

const withdrawRequestSchema = new mongoose.Schema(
  {
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    rejectionReason: { type: String, default: '' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
  },
  { timestamps: true }
)

export default mongoose.model('WithdrawRequest', withdrawRequestSchema)
