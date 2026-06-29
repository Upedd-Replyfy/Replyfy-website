import Category from '../models/Category.js'
import ExpertType from '../models/ExpertType.js'
import ExpertProfile from '../models/ExpertProfile.js'
import Rating from '../models/Rating.js'
import { asyncHandler } from '../utils/ApiError.js'
import { formatExpert } from '../utils/formatExpert.js'

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .select('name slug description placeholder suggestions icon sortOrder')
    .sort({ sortOrder: 1, name: 1 })
  res.json({ success: true, categories })
})

export const getExpertTypes = asyncHandler(async (req, res) => {
  const { category } = req.query
  if (!category) {
    return res.status(400).json({ success: false, message: 'category query parameter is required' })
  }

  const expertTypes = await ExpertType.find({ category, isActive: true })
    .select('name slug description category sortOrder')
    .sort({ sortOrder: 1, name: 1 })

  res.json({ success: true, expertTypes })
})

export const getExperts = asyncHandler(async (req, res) => {
  const {
    category,
    expertType,
    type,
    availability = 'available',
    rating,
    minPrice,
    maxPrice,
    experience,
    search,
    sort = 'rating',
    page = 1,
    limit = 12,
  } = req.query

  const query = { status: 'active' }

  if (category) query.category = category
  if (expertType || type) query.expertType = expertType || type
  if (availability) query.availability = availability

  if (rating) query.averageRating = { $gte: Number(rating) }
  if (minPrice || maxPrice) {
    query.questionPrice = {}
    if (minPrice) query.questionPrice.$gte = Number(minPrice)
    if (maxPrice) query.questionPrice.$lte = Number(maxPrice)
  }
  if (experience) {
    query.experience = { $regex: experience, $options: 'i' }
  }

  const sortMap = {
    rating: { averageRating: -1, completedAnswers: -1 },
    price_asc: { questionPrice: 1 },
    price_desc: { questionPrice: -1 },
    response: { responseTime: 1 },
    experience: { completedAnswers: -1 },
  }

  let profiles = await ExpertProfile.find(query)
    .populate('user', 'name avatar isActive')
    .populate('category', 'name slug')
    .populate('expertType', 'name slug description')
    .sort(sortMap[sort] || sortMap.rating)
    .lean()

  profiles = profiles.filter((p) => p.user?.isActive)

  if (search) {
    const s = search.toLowerCase()
    profiles = profiles.filter(
      (p) =>
        p.user.name.toLowerCase().includes(s) ||
        (p.skills || []).some((skill) => skill.toLowerCase().includes(s)) ||
        (p.languages || []).some((lang) => lang.toLowerCase().includes(s)) ||
        p.bio.toLowerCase().includes(s)
    )
  }

  const total = profiles.length
  const start = (Number(page) - 1) * Number(limit)
  const paginated = profiles.slice(start, start + Number(limit))

  res.json({
    success: true,
    experts: paginated.map((p) => formatExpert(p)),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  })
})

export const getExpertById = asyncHandler(async (req, res) => {
  let profile = await ExpertProfile.findById(req.params.id)
    .populate('user', 'name avatar isActive')
    .populate('category', 'name slug')
    .populate('expertType', 'name slug description')

  if (!profile) {
    profile = await ExpertProfile.findOne({ user: req.params.id })
      .populate('user', 'name avatar isActive')
      .populate('category', 'name slug')
      .populate('expertType', 'name slug description')
  }

  if (!profile) return res.status(404).json({ success: false, message: 'Expert not found' })

  const ratings = await Rating.find({ expert: profile.user._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(10)

  res.json({ success: true, expert: formatExpert(profile), ratings })
})

export const getPlatformStats = asyncHandler(async (req, res) => {
  const [expertCount, answerCount, avgResponse] = await Promise.all([
    ExpertProfile.countDocuments({ status: 'active', availability: 'available' }),
    ExpertProfile.aggregate([{ $group: { _id: null, total: { $sum: '$completedAnswers' } } }]),
    ExpertProfile.aggregate([{ $group: { _id: null, avg: { $avg: '$responseTime' } } }]),
  ])

  res.json({
    success: true,
    stats: {
      experts: expertCount,
      answers: answerCount[0]?.total || 0,
      avgResponseHours: Math.round(avgResponse[0]?.avg || 24),
    },
  })
})
