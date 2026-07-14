import Rating from '../models/Rating.js'
import Question from '../models/Question.js'
import ExpertProfile from '../models/ExpertProfile.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { creditExpertWallet } from '../services/walletService.js'
import { createNotification } from '../services/notificationService.js'
import User from '../models/User.js'

export const submitRating = asyncHandler(async (req, res) => {
  const { questionId, stars, comment } = req.body

  const question = await Question.findOne({
    _id: questionId,
    user: req.user._id,
    status: 'completed',
  })
  if (!question) throw new ApiError(404, 'Question not found or not completed')
  if (question.isRated) throw new ApiError(400, 'Already rated')
  if (!question.assignedExpert) throw new ApiError(400, 'No mentor assigned')

  const rating = await Rating.create({
    question: questionId,
    user: req.user._id,
    expert: question.assignedExpert,
    stars,
    comment: comment || '',
  })

  question.isRated = true
  await question.save()

  const profile = await ExpertProfile.findOne({ user: question.assignedExpert })
  if (profile) {
    const total = profile.totalRatings + 1
    profile.averageRating = (profile.averageRating * profile.totalRatings + stars) / total
    profile.totalRatings = total
    await profile.save()
  }

  const { creditAmount } = await creditExpertWallet({
    expertId: question.assignedExpert,
    amount: question.amount,
    questionId: question._id,
    description: 'Earnings from rated question',
  })

  const expert = await User.findById(question.assignedExpert)
  await createNotification({
    userId: question.assignedExpert,
    type: 'wallet_credited',
    title: 'Wallet Credited',
    message: `₹${creditAmount / 100} credited to your wallet after rating.`,
    link: '/expert/wallet',
    email: expert?.email,
  })

  res.status(201).json({ success: true, rating })
})

export const getQuestionRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findOne({ question: req.params.questionId, user: req.user._id })
  res.json({ success: true, rating })
})
