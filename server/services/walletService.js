import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import Question from '../models/Question.js'
import { getPlanBySlug } from './planService.js'

export async function creditExpertWallet({ expertId, amount, questionId, description, session }) {
  const creditAmount = Math.max(0, Math.floor(Number(amount) || 0))
  if (!expertId || !creditAmount) return { wallet: null, creditAmount: 0 }

  let wallet = await Wallet.findOne({ expert: expertId }).session(session || null)
  if (!wallet) {
    const created = await Wallet.create([{ expert: expertId }], { session })
    wallet = created[0]
  }

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
        description: description || 'Points from completed question',
        question: questionId,
      },
    ],
    { session }
  )

  return { wallet, creditAmount }
}

export async function creditMentorPointsForQuestion({ question, expertId }) {
  if (!question?._id || !expertId) return { creditAmount: 0, skipped: true }

  const claimed = await Question.findOneAndUpdate(
    { _id: question._id, pointsCredited: { $ne: true } },
    { $set: { pointsCredited: true, pointsCreditedAt: new Date() } },
    { new: true }
  )
  if (!claimed) return { creditAmount: 0, skipped: true }

  let credit = Math.max(0, Math.floor(Number(claimed.mentorPointsPaise) || 0))
  if (!credit) {
    const plan = await getPlanBySlug(claimed.plan, { activeOnly: false })
    credit = Math.max(0, Math.floor(Number(plan?.mentorPointsPaise) || 0))
  }

  if (!credit) return { creditAmount: 0 }

  try {
    return await creditExpertWallet({
      expertId,
      amount: credit,
      questionId: claimed._id,
      description: `Points for answering "${claimed.title}"`,
    })
  } catch (err) {
    await Question.updateOne(
      { _id: claimed._id },
      { $set: { pointsCredited: false }, $unset: { pointsCreditedAt: 1 } }
    )
    throw err
  }
}
