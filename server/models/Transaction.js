import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, default: '' },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    withdrawRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'WithdrawRequest' },
  },
  { timestamps: true }
)

export default mongoose.model('Transaction', transactionSchema)
