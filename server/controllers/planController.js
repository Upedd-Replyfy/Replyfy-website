import Plan from '../models/Plan.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { slugify } from '../utils/slug.js'
import {
  ensureDefaultPlans,
  formatPlanPublic,
  getAllPlans,
  invalidatePlanCache,
} from '../services/planService.js'

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return value === true || value === 'true' || value === 1 || value === '1'
}

function parsePricePaise(body) {
  if (body.pricePaise != null && body.pricePaise !== '') {
    return Math.round(Number(body.pricePaise))
  }
  if (body.price != null && body.price !== '') {
    return Math.round(Number(body.price) * 100)
  }
  return null
}

function parseMentorPointsPaise(body) {
  if (body.mentorPointsPaise != null && body.mentorPointsPaise !== '') {
    return Math.round(Number(body.mentorPointsPaise))
  }
  if (body.mentorPoints != null && body.mentorPoints !== '') {
    return Math.round(Number(body.mentorPoints) * 100)
  }
  return null
}

function parseFeatures(features) {
  if (Array.isArray(features)) {
    return features.map((f) => String(f).trim()).filter(Boolean)
  }
  if (typeof features === 'string') {
    return features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
  }
  return []
}

async function uniqueSlug(name, explicit, excludeId) {
  const base = slugify(explicit || name)
  if (!base) throw new ApiError(400, 'A plan name is required')
  let slug = base
  let n = 2
  while (true) {
    const existing = await Plan.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
    if (!existing) return slug
    slug = `${base}-${n}`
    n += 1
  }
}

export const listAdminPlans = asyncHandler(async (req, res) => {
  const plans = await getAllPlans()
  res.json({
    success: true,
    plans: plans.map((plan) => formatPlanPublic(plan, { includeAdmin: true })),
  })
})

export const createPlan = asyncHandler(async (req, res) => {
  const { name, tagline, popular, requiresExpertSelection, isActive, sortOrder } = req.body
  if (!String(name || '').trim()) throw new ApiError(400, 'Name is required')

  const pricePaise = parsePricePaise(req.body)
  if (!pricePaise || pricePaise < 100) throw new ApiError(400, 'Enter a valid price of at least ₹1')

  const mentorPointsPaise = parseMentorPointsPaise(req.body)
  if (mentorPointsPaise == null || mentorPointsPaise < 0) {
    throw new ApiError(400, 'Enter mentor points of 0 or more')
  }

  const slug = await uniqueSlug(name, req.body.slug)
  const plan = await Plan.create({
    name: String(name).trim(),
    slug,
    tagline: String(tagline || '').trim(),
    pricePaise,
    mentorPointsPaise,
    features: parseFeatures(req.body.features),
    requiresExpertSelection: toBool(requiresExpertSelection),
    popular: toBool(popular),
    isActive: toBool(isActive, true),
    sortOrder: Number(sortOrder) || 0,
    createdBy: req.user._id,
  })
  invalidatePlanCache()
  res.status(201).json({ success: true, plan: formatPlanPublic(plan, { includeAdmin: true }) })
})

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id)
  if (!plan) throw new ApiError(404, 'Plan not found')

  if (req.body.name != null) plan.name = String(req.body.name).trim()
  if (req.body.tagline != null) plan.tagline = String(req.body.tagline).trim()
  if (req.body.features != null) plan.features = parseFeatures(req.body.features)
  if (req.body.sortOrder != null) plan.sortOrder = Number(req.body.sortOrder) || 0
  if (req.body.popular != null) plan.popular = toBool(req.body.popular)
  if (req.body.requiresExpertSelection != null) {
    plan.requiresExpertSelection = toBool(req.body.requiresExpertSelection)
  }

  const pricePaise = parsePricePaise(req.body)
  if (pricePaise != null) {
    if (pricePaise < 100) throw new ApiError(400, 'Enter a valid price of at least ₹1')
    plan.pricePaise = pricePaise
  }

  const mentorPointsPaise = parseMentorPointsPaise(req.body)
  if (mentorPointsPaise != null) {
    if (mentorPointsPaise < 0) throw new ApiError(400, 'Enter mentor points of 0 or more')
    plan.mentorPointsPaise = mentorPointsPaise
  }

  if (req.body.isActive != null) {
    const nextActive = toBool(req.body.isActive)
    if (!nextActive) {
      const otherActive = await Plan.countDocuments({ _id: { $ne: plan._id }, isActive: true })
      if (otherActive === 0) throw new ApiError(400, 'Keep at least one active plan')
    }
    plan.isActive = nextActive
  }

  if (!plan.name) throw new ApiError(400, 'Name is required')
  await plan.save()
  invalidatePlanCache()
  res.json({ success: true, plan: formatPlanPublic(plan, { includeAdmin: true }) })
})

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id)
  if (!plan) throw new ApiError(404, 'Plan not found')

  const remaining = await Plan.countDocuments({ _id: { $ne: plan._id } })
  if (remaining === 0) throw new ApiError(400, 'Keep at least one plan')

  if (plan.isActive) {
    const otherActive = await Plan.countDocuments({ _id: { $ne: plan._id }, isActive: true })
    if (otherActive === 0) {
      throw new ApiError(400, 'Enable or keep another active plan before deleting this one')
    }
  }

  await Plan.deleteOne({ _id: plan._id })
  invalidatePlanCache()
  res.json({ success: true, message: 'Plan deleted' })
})

export const listPublicPlans = asyncHandler(async (req, res) => {
  await ensureDefaultPlans()
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
  res.json({
    success: true,
    plans: plans.map((plan) => formatPlanPublic(plan)),
  })
})
