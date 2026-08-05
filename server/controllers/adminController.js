import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import ExpertProfile from '../models/ExpertProfile.js'
import Category from '../models/Category.js'
import Question from '../models/Question.js'
import Answer from '../models/Answer.js'
import Payment from '../models/Payment.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import WithdrawRequest from '../models/WithdrawRequest.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { assignExpertToQuestion, findAvailableExpert } from '../services/assignmentService.js'
import { createNotification } from '../services/notificationService.js'
import { logAudit } from '../services/auditService.js'
import { planRequiresExpertSelection } from '../constants/pricing.js'
import ExpertType from '../models/ExpertType.js'
import { slugify } from '../utils/slug.js'
import { resolveIdList, mergeCategoryIdsWithTypes } from '../utils/expertMatch.js'
import { applyProfileDetails } from '../utils/profileDetails.js'
import {
  aggregateByDay,
  getLastNDays,
  getPeriodTrend,
  startOfDay,
} from '../services/dashboardAnalytics.js'

function buildActivityFeed(items) {
  return items
    .filter(Boolean)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12)
}

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = startOfDay()

  const [
    totalUsers,
    totalExperts,
    verifiedExperts,
    pendingQuestions,
    pendingAnswers,
    pendingWithdrawals,
    totalRevenueAgg,
    completedQuestions,
    totalQuestions,
    todayRevenueAgg,
    todayQuestions,
    todayAnswers,
    onlineExperts,
    revenueByDay,
    questionsByDay,
    answersByDay,
    usersByDay,
    expertsByDay,
    userTrend,
    expertTrend,
    revenueTrend,
    questionTrend,
    pendingQuestionsList,
    recentUsers,
    recentExperts,
    recentQuestions,
    recentAnswers,
    recentPayments,
    recentWithdrawals,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'expert' }),
    ExpertProfile.countDocuments({ isVerified: true, status: 'active' }),
    Question.countDocuments({ status: 'pending_admin_review' }),
    Answer.countDocuments({ status: 'pending_review' }),
    WithdrawRequest.countDocuments({ status: 'pending' }),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Question.countDocuments({ status: 'completed' }),
    Question.countDocuments({ status: { $nin: ['pending_payment', 'cancelled'] } }),
    Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Question.countDocuments({ createdAt: { $gte: today } }),
    Answer.countDocuments({ createdAt: { $gte: today } }),
    ExpertProfile.countDocuments({ availability: 'available', status: 'active' }),
    aggregateByDay(Payment, { status: 'paid' }, 'amount', 14),
    aggregateByDay(Question, {}, 'count', 14),
    aggregateByDay(Answer, {}, 'count', 14),
    aggregateByDay(User, { role: 'user' }, 'count', 14),
    aggregateByDay(User, { role: 'expert' }, 'count', 14),
    getPeriodTrend(User, { role: 'user' }),
    getPeriodTrend(User, { role: 'expert' }),
    getPeriodTrend(Payment, { status: 'paid' }),
    getPeriodTrend(Question, {}),
    Question.find({ status: 'pending_admin_review' })
      .populate('user', 'name email avatar')
      .populate('category', 'name')
      .populate('selectedExpert', 'name')
      .sort({ createdAt: -1 })
      .limit(8),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(4).select('name avatar createdAt'),
    ExpertProfile.find({ isVerified: true })
      .populate('user', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(3),
    Question.find({ status: 'pending_admin_review' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(3),
    Answer.find({ status: 'approved' })
      .populate('expert', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(3),
    Payment.find({ status: 'paid' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(3),
    WithdrawRequest.find({ status: 'pending' })
      .populate('expert', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(3),
  ])

  const totalRevenue = totalRevenueAgg[0]?.total || 0
  const todayRevenue = todayRevenueAgg[0]?.total || 0
  const successRate = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
  const platformGrowth = userTrend.change

  const activity = buildActivityFeed([
    ...recentUsers.map((u) => ({
      id: `user-${u._id}`,
      type: 'user_joined',
      title: 'New user joined',
      subtitle: u.name,
      avatar: u.avatar,
      at: u.createdAt,
    })),
    ...recentExperts.map((e) => ({
      id: `expert-${e._id}`,
      type: 'expert_verified',
      title: 'Mentor verified',
      subtitle: e.user?.name,
      avatar: e.user?.avatar || e.profilePhoto,
      at: e.updatedAt,
    })),
    ...recentQuestions.map((q) => ({
      id: `question-${q._id}`,
      type: 'question_submitted',
      title: 'Question submitted',
      subtitle: q.title,
      avatar: q.user?.avatar,
      at: q.createdAt,
    })),
    ...recentAnswers.map((a) => ({
      id: `answer-${a._id}`,
      type: 'answer_approved',
      title: 'Answer approved',
      subtitle: a.expert?.name,
      avatar: a.expert?.avatar,
      at: a.updatedAt,
    })),
    ...recentPayments.map((p) => ({
      id: `payment-${p._id}`,
      type: 'payment_completed',
      title: 'Payment completed',
      subtitle: `₹${p.amount / 100} · ${p.user?.name || 'User'}`,
      avatar: p.user?.avatar,
      at: p.createdAt,
    })),
    ...recentWithdrawals.map((w) => ({
      id: `withdraw-${w._id}`,
      type: 'withdrawal_requested',
      title: 'Withdrawal requested',
      subtitle: w.expert?.name,
      avatar: w.expert?.avatar,
      at: w.createdAt,
    })),
  ])

  const last7 = getLastNDays(7)
  const weeklyActivity = last7.map((date) => {
    const q = questionsByDay.find((d) => d.date === date)?.value ?? 0
    const a = answersByDay.find((d) => d.date === date)?.value ?? 0
    const u = usersByDay.find((d) => d.date === date)?.value ?? 0
    return {
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }),
      questions: q,
      answers: a,
      users: u,
      total: q + a + u,
    }
  })

  const monthlyEarnings = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const agg = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    monthlyEarnings.push({
      month: start.toLocaleDateString('en-IN', { month: 'short' }),
      value: (agg[0]?.total || 0) / 100,
    })
  }

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalExperts,
      verifiedExperts,
      pendingQuestions,
      pendingAnswers,
      pendingWithdrawals,
      totalRevenue,
      completedQuestions,
      successRate,
      platformGrowth,
      todayRevenue,
      todayQuestions,
      todayAnswers,
      onlineExperts,
    },
    trends: {
      users: userTrend,
      experts: expertTrend,
      revenue: revenueTrend,
      questions: questionTrend,
      answers: { change: 8, direction: 'up' },
      withdrawals: { change: 0, direction: 'neutral' },
      successRate: { change: 4, direction: 'up' },
      platformGrowth: userTrend,
    },
    charts: {
      revenueByDay: revenueByDay.map((d) => ({ ...d, value: d.value / 100 })),
      questionsByDay,
      answersByDay,
      usersByDay,
      expertsByDay,
      monthlyEarnings,
      weeklyActivity,
    },
    activity,
    pendingQuestions: pendingQuestionsList,
  })
})

export const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, role } = req.query
  const query = role && role !== 'all' ? { role } : { role: { $in: ['user', 'expert', 'admin'] } }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ])
  res.json({ success: true, users, pagination: { page: Number(page), total } })
})

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user || user.role === 'admin') throw new ApiError(404, 'User not found')
  user.isActive = !user.isActive
  await user.save()
  res.json({ success: true, user: { _id: user._id, isActive: user.isActive } })
})

export const createExpert = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    bio,
    experience,
    languages,
    skills,
    category,
    expertType,
    categories: categoriesRaw,
    expertTypes: expertTypesRaw,
    responseTime,
    hourlyPrice,
    questionPrice,
    maxAssignments,
    isVerified,
    availability,
  } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw new ApiError(400, 'Email already exists')

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

  if (!typeIds.length) {
    throw new ApiError(400, 'Select at least one mentor type')
  }

  const invalidIds = [...categoryIds, ...typeIds].filter(
    (id) => !mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)
  )
  if (invalidIds.length) {
    throw new ApiError(400, 'Invalid category or mentor type id received')
  }

  const types = await ExpertType.find({ _id: { $in: typeIds } })
  if (types.length !== typeIds.length) throw new ApiError(400, 'Invalid mentor type selection')

  // Include parent categories of every selected type so multi-select never fails mismatch checks
  categoryIds = mergeCategoryIdsWithTypes(categoryIds, types)
  if (!categoryIds.length) {
    throw new ApiError(400, 'Select at least one category and mentor type')
  }

  const cats = await Category.find({ _id: { $in: categoryIds } })
  if (cats.length !== categoryIds.length) throw new ApiError(400, 'Invalid category selection')

  // Primary pair: first type + its own category (always consistent)
  const primaryTypeDoc = types.find((t) => String(t._id) === String(typeIds[0])) || types[0]
  const primaryType = String(primaryTypeDoc._id)
  const primaryCategory = String(primaryTypeDoc.category)

  let profilePhoto = ''
  if (req.file) {
    const { uploadBufferToCloudinary } = await import('../config/cloudinary.js')
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'replyfy/experts', req.file.originalname)
    profilePhoto = uploaded.url
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'expert',
    avatar: profilePhoto || undefined,
  })

  const profile = await ExpertProfile.create({
    user: user._id,
    category: primaryCategory,
    expertType: primaryType,
    categories: categoryIds,
    expertTypes: typeIds,
    bio: bio || '',
    experience: experience || '',
    languages: Array.isArray(languages) ? languages : (languages || '').split(',').map((s) => s.trim()).filter(Boolean),
    skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
    responseTime: responseTime || 48,
    hourlyPrice: hourlyPrice || 0,
    questionPrice: questionPrice || 99900,
    maxAssignments: maxAssignments || 5,
    profilePhoto,
    isVerified: isVerified === true || isVerified === 'true',
    availability: availability || 'available',
    status: 'active',
    createdBy: req.user._id,
  })

  applyProfileDetails(profile, req.body)
  if (profile.isModified()) await profile.save()

  // Force-persist multi arrays (guards against hosts that drop array fields on insert)
  await ExpertProfile.updateOne(
    { _id: profile._id },
    {
      $set: {
        categories: categoryIds,
        expertTypes: typeIds,
        category: primaryCategory,
        expertType: primaryType,
        education: profile.education || [],
        certificates: profile.certificates || [],
        achievements: profile.achievements || [],
      },
    }
  )

  await Wallet.create({ expert: user._id })

  await logAudit({
    action: 'expert_created',
    entityType: 'ExpertProfile',
    entityId: profile._id,
    performedBy: req.user._id,
    ip: req.ip,
  })

  const populated = await ExpertProfile.findById(profile._id)
    .populate('user', 'name email avatar isActive')
    .populate('category', 'name slug')
    .populate('expertType', 'name slug')
    .populate('categories', 'name slug')
    .populate('expertTypes', 'name slug')

  res.status(201).json({
    success: true,
    expert: populated,
  })
})

export const getExperts = asyncHandler(async (req, res) => {
  const profiles = await ExpertProfile.find()
    .populate('user', 'name email avatar isActive')
    .populate('category', 'name slug')
    .populate('expertType', 'name slug')
    .populate('categories', 'name slug')
    .populate('expertTypes', 'name slug')
    .sort({ createdAt: -1 })

  // Hydrate any refs that failed to populate (orphaned / unpopulated ObjectIds)
  const unresolvedCategoryIds = new Set()
  const unresolvedTypeIds = new Set()
  for (const profile of profiles) {
    for (const item of profile.categories || []) {
      if (!item?.name) unresolvedCategoryIds.add(String(item?._id || item))
    }
    if (profile.category && !profile.category.name) {
      unresolvedCategoryIds.add(String(profile.category._id || profile.category))
    }
    for (const item of profile.expertTypes || []) {
      if (!item?.name) unresolvedTypeIds.add(String(item?._id || item))
    }
    if (profile.expertType && !profile.expertType.name) {
      unresolvedTypeIds.add(String(profile.expertType._id || profile.expertType))
    }
  }

  const [extraCats, extraTypes] = await Promise.all([
    unresolvedCategoryIds.size
      ? Category.find({ _id: { $in: [...unresolvedCategoryIds] } }).select('name slug')
      : [],
    unresolvedTypeIds.size
      ? ExpertType.find({ _id: { $in: [...unresolvedTypeIds] } }).select('name slug')
      : [],
  ])
  const catMap = new Map(extraCats.map((c) => [String(c._id), c]))
  const typeMap = new Map(extraTypes.map((t) => [String(t._id), t]))

  const experts = profiles.map((profile) => {
    const doc = profile.toObject()
    const resolveCat = (item) => {
      if (item?.name) return item
      const id = String(item?._id || item || '')
      return catMap.get(id) || null
    }
    const resolveType = (item) => {
      if (item?.name) return item
      const id = String(item?._id || item || '')
      return typeMap.get(id) || null
    }
    doc.category = resolveCat(doc.category)
    doc.expertType = resolveType(doc.expertType)
    doc.categories = (doc.categories || []).map(resolveCat).filter(Boolean)
    doc.expertTypes = (doc.expertTypes || []).map(resolveType).filter(Boolean)
    if (!doc.categories.length && doc.category) doc.categories = [doc.category]
    if (!doc.expertTypes.length && doc.expertType) doc.expertTypes = [doc.expertType]
    return doc
  })

  res.json({ success: true, experts })
})

/** Backfill empty categories/expertTypes arrays from primary fields (safe repair). */
export const syncExpertCatalog = asyncHandler(async (req, res) => {
  const profiles = await ExpertProfile.find()
  let updated = 0

  for (const profile of profiles) {
    let dirty = false
    const categoryIds = [...new Set(
      [profile.category, ...(profile.categories || [])]
        .map((c) => String(c?._id || c || ''))
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    )]
    const typeIds = [...new Set(
      [profile.expertType, ...(profile.expertTypes || [])]
        .map((t) => String(t?._id || t || ''))
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    )]

    if (categoryIds.length && JSON.stringify(categoryIds) !== JSON.stringify((profile.categories || []).map((c) => String(c)))) {
      profile.categories = categoryIds
      if (!profile.category) profile.category = categoryIds[0]
      dirty = true
    }
    if (typeIds.length && JSON.stringify(typeIds) !== JSON.stringify((profile.expertTypes || []).map((t) => String(t)))) {
      profile.expertTypes = typeIds
      if (!profile.expertType) profile.expertType = typeIds[0]
      dirty = true
    }
    if (dirty) {
      await profile.save()
      updated += 1
    }
  }

  res.json({ success: true, updated, message: `Synced catalog arrays on ${updated} mentors` })
})

export const updateExpert = asyncHandler(async (req, res) => {
  const profile = await ExpertProfile.findById(req.params.id).populate('user')
  if (!profile) throw new ApiError(404, 'Mentor not found')

  const {
    bio,
    experience,
    languages,
    skills,
    category,
    expertType,
    categories: categoriesRaw,
    expertTypes: expertTypesRaw,
    availability,
    responseTime,
    hourlyPrice,
    questionPrice,
    maxAssignments,
    isVerified,
    status,
    isActive,
  } = req.body

  if (categoriesRaw !== undefined || expertTypesRaw !== undefined || category !== undefined || expertType !== undefined
    || req.body.categoriesJson !== undefined || req.body.expertTypesJson !== undefined) {
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
    } else if (categoryIds.length) {
      profile.categories = categoryIds
      profile.category = categoryIds[0]
    } else {
      if (category !== undefined) profile.category = category
      if (expertType !== undefined) profile.expertType = expertType
    }
  }
  if (bio !== undefined) profile.bio = bio
  if (experience !== undefined) profile.experience = experience
  if (languages !== undefined) {
    profile.languages = Array.isArray(languages) ? languages : languages.split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (skills !== undefined) {
    profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (availability !== undefined) profile.availability = availability
  if (responseTime !== undefined) profile.responseTime = responseTime
  if (hourlyPrice !== undefined) profile.hourlyPrice = hourlyPrice
  if (questionPrice !== undefined) profile.questionPrice = questionPrice
  if (maxAssignments !== undefined) profile.maxAssignments = maxAssignments
  if (isVerified !== undefined) profile.isVerified = isVerified === true || isVerified === 'true'
  if (status !== undefined) profile.status = status

  applyProfileDetails(profile, req.body)

  if (req.file) {
    const { uploadBufferToCloudinary } = await import('../config/cloudinary.js')
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'replyfy/experts', req.file.originalname)
    profile.profilePhoto = uploaded.url
    profile.user.avatar = uploaded.url
    await profile.user.save()
  }

  await profile.save()

  if (isActive !== undefined && profile.user) {
    profile.user.isActive = isActive === true || isActive === 'true'
    await profile.user.save()
  }

  res.json({ success: true, profile })
})

export const deleteExpert = asyncHandler(async (req, res) => {
  const profile = await ExpertProfile.findById(req.params.id).populate('user')
  if (!profile) throw new ApiError(404, 'Mentor not found')

  const expertUserId = profile.user?._id
  if (expertUserId) {
    const activeQuestions = await Question.countDocuments({
      assignedExpert: expertUserId,
      status: { $in: ['assigned', 'in_progress', 'waiting_admin_review'] },
    })
    if (activeQuestions > 0) {
      throw new ApiError(400, 'Cannot delete mentor with active question assignments')
    }
  }

  const QuestionAssignment = (await import('../models/QuestionAssignment.js')).default
  const Rating = (await import('../models/Rating.js')).default

  if (expertUserId) {
    await QuestionAssignment.deleteMany({ expert: expertUserId })
    await Wallet.deleteOne({ expert: expertUserId })
    await Transaction.deleteMany({ expert: expertUserId })
    await Rating.deleteMany({ expert: expertUserId })
    await WithdrawRequest.deleteMany({ expert: expertUserId })
  }

  await ExpertProfile.findByIdAndDelete(profile._id)

  if (profile.user) {
    await User.findByIdAndDelete(profile.user._id)
  }

  await logAudit({
    action: 'expert_deleted',
    entityType: 'ExpertProfile',
    entityId: profile._id,
    performedBy: req.user._id,
    ip: req.ip,
  })

  res.json({ success: true, message: 'Mentor profile deleted' })
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, placeholder, suggestions, icon, sortOrder } = req.body
  const slug = slugify(name)
  const category = await Category.create({
    name,
    slug,
    description,
    placeholder,
    suggestions: Array.isArray(suggestions) ? suggestions : [],
    icon,
    sortOrder,
    createdBy: req.user._id,
  })
  res.status(201).json({ success: true, category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw new ApiError(404, 'Category not found')
  category.isActive = false
  await category.save()
  await ExpertType.updateMany({ category: category._id }, { isActive: false })
  res.json({ success: true, message: 'Category disabled' })
})

export const getExpertTypes = asyncHandler(async (req, res) => {
  const { category } = req.query
  const query = category ? { category } : {}
  const expertTypes = await ExpertType.find(query)
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, name: 1 })
  res.json({ success: true, expertTypes })
})

export const createExpertType = asyncHandler(async (req, res) => {
  const { name, description, placeholder, suggestions, category, sortOrder } = req.body
  const cat = await Category.findById(category)
  if (!cat) throw new ApiError(400, 'Invalid category')

  const slug = slugify(name)
  const exists = await ExpertType.findOne({ category, slug })
  if (exists) throw new ApiError(400, 'Mentor type already exists for this category')

  const expertType = await ExpertType.create({
    name,
    slug,
    description: description || '',
    placeholder: placeholder || '',
    suggestions: Array.isArray(suggestions) ? suggestions : [],
    category,
    sortOrder: sortOrder || 0,
    createdBy: req.user._id,
  })

  res.status(201).json({ success: true, expertType })
})

export const updateExpertType = asyncHandler(async (req, res) => {
  const expertType = await ExpertType.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!expertType) throw new ApiError(404, 'Mentor type not found')
  res.json({ success: true, expertType })
})

export const deleteExpertType = asyncHandler(async (req, res) => {
  const expertType = await ExpertType.findById(req.params.id)
  if (!expertType) throw new ApiError(404, 'Mentor type not found')
  expertType.isActive = false
  await expertType.save()
  res.json({ success: true, message: 'Mentor type disabled' })
})

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 })
  res.json({ success: true, categories })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!category) throw new ApiError(404, 'Category not found')
  res.json({ success: true, category })
})

export const getPendingQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ status: 'pending_admin_review' })
    .populate('user', 'name email')
    .populate('category', 'name')
    .populate('selectedExpert', 'name')
    .sort({ createdAt: 1 })
  res.json({ success: true, questions })
})

export const getAllQuestions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const query = status ? { status } : {}
  const [questions, total] = await Promise.all([
    Question.find(query)
      .populate('user', 'name email')
      .populate('category', 'name')
      .populate('expertType', 'name')
      .populate('assignedExpert', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Question.countDocuments(query),
  ])
  res.json({ success: true, questions, pagination: { page: Number(page), total } })
})

export const approveQuestion = asyncHandler(async (req, res) => {
  const { expertId: overrideExpertId } = req.body
  const question = await Question.findById(req.params.id).populate('user')
  if (!question || question.status !== 'pending_admin_review') {
    throw new ApiError(400, 'Question not eligible for approval')
  }

  let expertId = overrideExpertId || question.selectedExpert
  const isAdminOverride = Boolean(overrideExpertId)

  if (!expertId && question.plan === 'basic') {
    const expert = await findAvailableExpert(question.category, question.expertType)
    if (!expert) throw new ApiError(400, 'No available mentor for this category and mentor type')
    expertId = expert.user._id
  } else if (!expertId) {
    throw new ApiError(400, 'No mentor selected for this plan')
  }

  await assignExpertToQuestion({
    question,
    expertUserId: expertId,
    assignedBy: req.user._id,
    assignmentType: isAdminOverride
      ? 'manual'
      : planRequiresExpertSelection(question.plan)
        ? 'user_selected'
        : 'auto',
    relaxAvailability: isAdminOverride,
  })

  question.adminReviewedBy = req.user._id
  question.adminReviewedAt = new Date()
  await question.save()

  const expertUser = await User.findById(expertId)
  await createNotification({
    userId: question.user._id,
    type: 'question_approved',
    title: 'Question Approved',
    message: 'Your question has been approved and assigned to a mentor.',
    link: `/dashboard/questions/${question._id}`,
    email: question.user.email,
  })

  await createNotification({
    userId: expertId,
    type: 'expert_assigned',
    title: 'New Question Assigned',
    message: `You have been assigned: "${question.title}"`,
    link: `/expert/questions/${question._id}`,
    email: expertUser?.email,
  })

  res.json({ success: true, question })
})

export const rejectQuestion = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const question = await Question.findById(req.params.id).populate('user')
  if (!question || question.status !== 'pending_admin_review') {
    throw new ApiError(400, 'Question not eligible for rejection')
  }

  question.status = 'rejected'
  question.rejectionReason = reason || 'Rejected by admin'
  question.adminReviewedBy = req.user._id
  question.adminReviewedAt = new Date()
  await question.save()

  await createNotification({
    userId: question.user._id,
    type: 'question_rejected',
    title: 'Question Rejected',
    message: question.rejectionReason,
    link: `/dashboard/questions/${question._id}`,
    email: question.user.email,
  })

  res.json({ success: true, question })
})

export const assignExpertManual = asyncHandler(async (req, res) => {
  const { expertId } = req.body
  const question = await Question.findById(req.params.id)
  if (!question) throw new ApiError(404, 'Question not found')

  await assignExpertToQuestion({
    question,
    expertUserId: expertId,
    assignedBy: req.user._id,
    assignmentType: 'manual',
    relaxAvailability: true,
  })

  res.json({ success: true, question })
})

export const getPendingAnswers = asyncHandler(async (req, res) => {
  const answers = await Answer.find({ status: 'pending_review' })
    .populate({ path: 'question', populate: [{ path: 'user', select: 'name email' }, { path: 'category', select: 'name' }] })
    .populate('expert', 'name email')
    .sort({ submittedAt: 1 })
  res.json({ success: true, answers })
})

export const approveAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id)
  if (!answer || answer.status !== 'pending_review') {
    throw new ApiError(400, 'Answer not eligible for approval')
  }

  const question = await Question.findById(answer.question).populate('user')
  if (!question) throw new ApiError(404, 'Question not found')

  answer.status = 'approved'
  answer.reviewedBy = req.user._id
  answer.reviewedAt = new Date()
  await answer.save()

  question.status = 'completed'
  await question.save()

  const profile = await ExpertProfile.findOne({ user: answer.expert })
  if (profile) {
    profile.completedAnswers += 1
    profile.activeAssignments = Math.max(0, profile.activeAssignments - 1)
    await profile.save()
  }

  await createNotification({
    userId: question.user._id,
    type: 'answer_delivered',
    title: 'Your Answer is Ready',
    message: `Your question "${question.title}" has been answered.`,
    link: `/dashboard/questions/${question._id}`,
    email: question.user.email,
  })

  await createNotification({
    userId: question.user._id,
    type: 'rating_reminder',
    title: 'Rate Your Mentor',
    message: 'Please rate your experience with the mentor.',
    link: `/dashboard/questions/${question._id}/rate`,
    email: question.user.email,
  })

  res.json({ success: true, answer, question })
})

export const rejectAnswer = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const answer = await Answer.findById(req.params.id)
  if (!answer) throw new ApiError(404, 'Answer not found')

  answer.status = 'rejected'
  answer.rejectionReason = reason || 'Needs revision'
  answer.reviewedBy = req.user._id
  answer.reviewedAt = new Date()
  await answer.save()

  const question = await Question.findById(answer.question)
  question.status = 'in_progress'
  await question.save()

  const expert = await User.findById(answer.expert)
  await createNotification({
    userId: answer.expert,
    type: 'answer_rejected',
    title: 'Answer Needs Revision',
    message: answer.rejectionReason,
    link: `/expert/questions/${question._id}`,
    email: expert?.email,
  })

  res.json({ success: true, answer })
})

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('question', 'title')
    .sort({ createdAt: -1 })
    .limit(100)
  res.json({ success: true, payments })
})

export const getWithdrawals = asyncHandler(async (req, res) => {
  const requests = await WithdrawRequest.find()
    .populate('expert', 'name email')
    .sort({ createdAt: -1 })
  res.json({ success: true, requests })
})

export const approveWithdrawal = asyncHandler(async (req, res) => {
  const request = await WithdrawRequest.findById(req.params.id)
  if (!request || request.status !== 'pending') throw new ApiError(400, 'Invalid request')

  const wallet = await Wallet.findOne({ expert: request.expert })
  if (!wallet || wallet.balance < request.amount) throw new ApiError(400, 'Insufficient balance')

  wallet.balance -= request.amount
  wallet.totalWithdrawn += request.amount
  await wallet.save()

  await Transaction.create({
    wallet: wallet._id,
    expert: request.expert,
    type: 'withdrawal',
    amount: request.amount,
    balanceAfter: wallet.balance,
    description: 'Withdrawal approved',
    withdrawRequest: request._id,
  })

  request.status = 'approved'
  request.processedBy = req.user._id
  request.processedAt = new Date()
  await request.save()

  const expert = await User.findById(request.expert)
  await createNotification({
    userId: request.expert,
    type: 'withdraw_approved',
    title: 'Withdrawal Approved',
    message: `Your withdrawal of ₹${request.amount / 100} has been approved.`,
    link: '/expert/wallet',
    email: expert?.email,
  })

  res.json({ success: true, request })
})

export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const request = await WithdrawRequest.findById(req.params.id)
  if (!request || request.status !== 'pending') throw new ApiError(400, 'Invalid request')

  request.status = 'rejected'
  request.rejectionReason = reason
  request.processedBy = req.user._id
  request.processedAt = new Date()
  await request.save()

  res.json({ success: true, request })
})

export const getAllNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 40, type } = req.query
  const query = type ? { type } : {}
  const pageNum = Math.max(1, Number(page) || 1)
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 40))

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notification.countDocuments(query),
  ])

  res.json({
    success: true,
    notifications,
    pagination: { page: pageNum, limit: limitNum, total },
  })
})

export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, link, audience = 'one' } = req.body
  if (!title?.trim() || !message?.trim()) {
    throw new ApiError(400, 'Title and message are required')
  }

  let recipients = []
  if (audience === 'all_users') {
    recipients = await User.find({ role: 'user', isActive: { $ne: false } }).select('_id email name')
  } else if (audience === 'all_mentors') {
    recipients = await User.find({ role: 'expert', isActive: { $ne: false } }).select('_id email name')
  } else {
    if (!userId) throw new ApiError(400, 'User is required')
    const user = await User.findById(userId).select('_id email name')
    if (!user) throw new ApiError(404, 'User not found')
    recipients = [user]
  }

  if (!recipients.length) throw new ApiError(404, 'No recipients found')

  // Email only for single personal sends to avoid bulk SMTP load
  const sendMail = audience === 'one'

  const notifications = await Promise.all(
    recipients.map((u) =>
      createNotification({
        userId: u._id,
        type: 'general',
        title: title.trim(),
        message: message.trim(),
        link: link || '',
        email: u.email,
        sendMail,
        metadata: { audience, broadcast: audience !== 'one' },
      })
    )
  )

  res.json({
    success: true,
    count: notifications.length,
    notification: notifications[0],
  })
})
