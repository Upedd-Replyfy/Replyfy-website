import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'

const EXPERT_SHARE_PERCENT = 70

export async function creditExpertWallet({ expertId, amount, questionId, description, session }) {
  let wallet = await Wallet.findOne({ expert: expertId }).session(session || null)
  if (!wallet) {
    const created = await Wallet.create([{ expert: expertId }], { session })
    wallet = created[0]
  }

  const creditAmount = Math.floor((amount * EXPERT_SHARE_PERCENT) / 100)
  wallet.balance += creditAmount
  wallet.totalEarned += creditAmount
  await wallet.save({ session })

  await Transaction.create(
    [
      {
        wallet: wallet._id,
        expert: expertId,
        type: 'credit',
        amount: creditAmount,
        balanceAfter: wallet.balance,
        description: description || 'Earnings from completed question',
        question: questionId,
      },
    ],
    { session }
  )

  return { wallet, creditAmount }
}
