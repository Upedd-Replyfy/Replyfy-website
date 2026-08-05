import Question from '../models/Question.js'
import Answer from '../models/Answer.js'
import ExpertProfile from '../models/ExpertProfile.js'
import Category from '../models/Category.js'
import ExpertType from '../models/ExpertType.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import WithdrawRequest from '../models/WithdrawRequest.js'
import Rating from '../models/Rating.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { uploadFiles } from '../utils/uploadFiles.js'
import { createNotification, notifyAdmins } from '../services/notificationService.js'
import User from '../models/User.js'
import { resolveIdList, mergeCategoryIdsWithTypes } from '../utils/expertMatch.js'
import { applyProfileDetails } from '../utils/profileDetails.js'
import { formatExpert } from '../utils/formatExpert.js'

export const getDashboard = asyncHandler(async (req, res) => {
  const expertId = req.user._id
  const [assigned, inProgress, completed, profile, wallet] = await Promise.all([
    Question.countDocuments({ assignedExpert: expertId, status: 'assigned' }),
    Question.countDocuments({ assignedExpert: expertId, status: { $in: ['assigned', 'in_progress', 'waiting_admin_review'] } }),
    Question.countDocuments({ assignedExpert: expertId, status: 'completed' }),
    ExpertProfile.findOne({ user: expertId }),
    Wallet.findOne({ expert: expertId }),
  ])

  res.json({
    success: true,
    stats: {
      assigned,
      inProgress,
      completed,
      averageRating: profile?.averageRating || 0,
      walletBalance: wallet?.balance || 0,
      totalEarned: wallet?.totalEarned || 0,
    },
  })
})

export const getAssignedQuestions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const query = { assignedExpert: req.user._id }
  if (status) query.status = status
  else query.status = { $in: ['assigned', 'in_progress', 'waiting_admin_review'] }

  const [questions, total] = await Promise.all([
    Question.find(query)
      .populate('category', 'name')
      .populate('user', 'name email')
      .sort({ deadline: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Question.countDocuments(query),
  ])

  res.json({ success: true, questions, pagination: { page: Number(page), limit: Number(limit), total } })
})

export const getQuestionDetail = asyncHandler(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    assignedExpert: req.user._id,
  })
    .populate('category')
    .populate('user', 'name email')

  if (!question) throw new ApiError(404, 'Question not found')

  const answer = await Answer.findOne({ question: question._id })
  res.json({ success: true, question, answer })
})

export const startQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    assignedExpert: req.user._id,
    status: 'assigned',
  })
  if (!question) throw new ApiError(404, 'Question not found')
  question.status = 'in_progress'
  await question.save()
  res.json({ success: true, question })
})

export const submitAnswer = asyncHandler(async (req, res) => {
  const { content } = req.body
  const question = await Question.findOne({
    _id: req.params.id,
    assignedExpert: req.user._id,
    status: { $in: ['assigned', 'in_progress'] },
  })
  if (!question) throw new ApiError(404, 'Question not found or not actionable')

  const existing = await Answer.findOne({ question: question._id })
  if (existing && existing.status !== 'rejected') {
    throw new ApiError(400, 'Answer already submitted')
  }

  const attachments = await uploadFiles(req.files, 'replyfy/answers')

  let answer
  if (existing?.status === 'rejected') {
    existing.content = content
    existing.attachments = attachments
    existing.status = 'pending_review'
    existing.rejectionReason = ''
    existing.submittedAt = new Date()
    await existing.save()
    answer = existing
  } else {
    answer = await Answer.create({
      question: question._id,
      expert: req.user._id,
      content,
      attachments,
      status: 'pending_review',
    })
  }

  question.status = 'waiting_admin_review'
  await question.save()

  const user = await User.findById(question.user)
  await createNotification({
    userId: question.user,
    type: 'answer_submitted',
    title: 'Answer Submitted for Review',
    message: 'A mentor has submitted an answer. It will be delivered after admin approval.',
    link: `/dashboard/questions/${question._id}`,
    email: user?.email,
  })

  const admins = await User.find({ role: 'admin', isActive: true })
  await notifyAdmins({
    type: 'answer_submitted',
    title: 'Answer Needs Review',
    message: `Mentor submitted answer for "${question.title}".`,
    link: `/admin/answers/${answer._id}`,
    admins,
  })

  res.json({ success: true, answer })
})

export const getExpertProfile = asyncHandler(async (req, res) => {
  const profile = await ExpertProfile.findOne({ user: req.user._id })
    .populate('category', 'name slug')
    .populate('expertType', 'name slug')
    .populate('categories', 'name slug')
    .populate('expertTypes', 'name slug')

  if (!profile) throw new ApiError(404, 'Mentor profile not found')

  res.json({
    success: true,
    profile: formatExpert({ ...profile.toObject(), user: req.user }),
  })
})

export const updateExpertProfile = asyncHandler(async (req, res) => {
  const {
    bio,
    experience,
    languages,
    skills,
    name,
    category,
    expertType,
    categories: categoriesRaw,
    expertTypes: expertTypesRaw,
  } = req.body

  const profile = await ExpertProfile.findOne({ user: req.user._id })
  if (!profile) throw new ApiError(404, 'Mentor profile not found')

  if (name !== undefined && String(name).trim()) {
    req.user.name = String(name).trim()
    await req.user.save()
  }

  if (
    categoriesRaw !== undefined ||
    expertTypesRaw !== undefined ||
    category !== undefined ||
    expertType !== undefined ||
    req.body.categoriesJson !== undefined ||
    req.body.expertTypesJson !== undefined
  ) {
    let categoryIds = resolveIdList(
      req.body.categoriesJson,
      req.body.categoryIds,
      categoriesRaw,
      category
    )
    let typeIds = resolveIdList(
      req.body.expertTypesJson,
      req.body.expertTypeIds,
      expertTypesRaw,
      expertType
    )

    if (typeIds.length) {
      const types = await ExpertType.find({ _id: { $in: typeIds } })
      if (types.length !== typeIds.length) throw new ApiError(400, 'Invalid mentor type selection')
      categoryIds = mergeCategoryIdsWithTypes(categoryIds, types)
      if (!categoryIds.length) throw new ApiError(400, 'Select at least one category and mentor type')
      const cats = await Category.find({ _id: { $in: categoryIds } })
      if (cats.length !== categoryIds.length) throw new ApiError(400, 'Invalid category selection')
      const primaryTypeDoc = types.find((t) => String(t._id) === String(typeIds[0])) || types[0]
      profile.categories = categoryIds
      profile.expertTypes = typeIds
      profile.category = primaryTypeDoc.category
      profile.expertType = primaryTypeDoc._id
    }
  }

  if (bio !== undefined) profile.bio = bio
  if (experience !== undefined) profile.experience = experience
  if (languages !== undefined) {
    profile.languages = Array.isArray(languages)
      ? languages
      : String(languages)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
  }
  if (skills !== undefined) {
    profile.skills = Array.isArray(skills)
      ? skills
      : String(skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
  }

  applyProfileDetails(profile, req.body)

  if (req.file) {
    const { uploadBufferToCloudinary } = await import('../config/cloudinary.js')
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'replyfy/experts', req.file.originalname)
    profile.profilePhoto = uploaded.url
    req.user.avatar = uploaded.url
    await req.user.save()
  }

  await profile.save()

  const populated = await ExpertProfile.findById(profile._id)
    .populate('category', 'name slug')
    .populate('expertType', 'name slug')
    .populate('categories', 'name slug')
    .populate('expertTypes', 'name slug')

  res.json({
    success: true,
    profile: formatExpert({ ...populated.toObject(), user: req.user }),
  })
})

export const getWallet = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ expert: req.user._id })
  if (!wallet) wallet = await Wallet.create({ expert: req.user._id })

  const transactions = await Transaction.find({ expert: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)

  res.json({ success: true, wallet, transactions })
})

export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankDetails } = req.body
  const wallet = await Wallet.findOne({ expert: req.user._id })
  if (!wallet || wallet.balance < amount) {
    throw new ApiError(400, 'Insufficient balance')
  }

  const request = await WithdrawRequest.create({
    expert: req.user._id,
    amount,
    bankDetails,
  })

  const admins = await User.find({ role: 'admin', isActive: true })
  await notifyAdmins({
    type: 'general',
    title: 'Withdrawal Request',
    message: `Mentor ${req.user.name} requested withdrawal of ₹${amount / 100}`,
    link: '/admin/withdrawals',
    admins,
  })

  res.status(201).json({ success: true, request })
})

export const getRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ expert: req.user._id })
    .populate('user', 'name')
    .populate('question', 'title')
    .sort({ createdAt: -1 })
  res.json({ success: true, ratings })
})

export const getAvailability = asyncHandler(async (req, res) => {
  const profile = await ExpertProfile.findOne({ user: req.user._id }).select(
    'availability videoCallAvailable status'
  )
  if (!profile) throw new ApiError(404, 'Mentor profile not found')
  res.json({
    success: true,
    availability: profile.availability,
    videoCallAvailable: profile.videoCallAvailable ?? false,
  })
})

export const updateAvailability = asyncHandler(async (req, res) => {
  const { availability, videoCallAvailable } = req.body
  if (availability === undefined && videoCallAvailable === undefined) {
    throw new ApiError(400, 'Provide availability and/or videoCallAvailable')
  }
  if (availability !== undefined && !['available', 'unavailable'].includes(availability)) {
    throw new ApiError(400, 'Availability must be available or unavailable')
  }

  const profile = await ExpertProfile.findOne({ user: req.user._id })
  if (!profile) throw new ApiError(404, 'Mentor profile not found')
  if (profile.status !== 'active') {
    throw new ApiError(400, 'Your mentor account is not active')
  }

  if (availability !== undefined) profile.availability = availability
  if (videoCallAvailable !== undefined) profile.videoCallAvailable = videoCallAvailable
  await profile.save()

  res.json({
    success: true,
    availability: profile.availability,
    videoCallAvailable: profile.videoCallAvailable,
  })
})
