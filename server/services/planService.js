import Plan from '../models/Plan.js'
import {
  DEFAULT_PLANS,
  fallbackPlanRequiresExpertSelection,
  formatPlanPublic,
  getFallbackPlanAmount,
} from '../constants/pricing.js'

let cache = { at: 0, active: null }
const CACHE_MS = 15_000

export function invalidatePlanCache() {
  cache = { at: 0, active: null }
}

export async function ensureDefaultPlans() {
  const count = await Plan.countDocuments()
  if (count > 0) return
  await Plan.insertMany(DEFAULT_PLANS.map((plan) => ({ ...plan, isActive: true })))
}

export async function getActivePlans() {
  const now = Date.now()
  if (cache.active && now - cache.at < CACHE_MS) return cache.active
  await ensureDefaultPlans()
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean()
  cache = { at: now, active: plans }
  return plans
}

export async function getAllPlans() {
  await ensureDefaultPlans()
  return Plan.find().sort({ sortOrder: 1, name: 1 })
}

export async function getPlanBySlug(slug, { activeOnly = true } = {}) {
  if (!slug) return null
  const query = { slug: String(slug).trim().toLowerCase() }
  if (activeOnly) query.isActive = true
  return Plan.findOne(query).lean()
}

export async function getPlanAmount(slug) {
  const plan = await getPlanBySlug(slug, { activeOnly: false })
  if (plan) return plan.pricePaise
  return getFallbackPlanAmount(slug)
}

export async function planRequiresExpertSelection(slug) {
  const plan = await getPlanBySlug(slug, { activeOnly: false })
  if (plan) return Boolean(plan.requiresExpertSelection)
  return fallbackPlanRequiresExpertSelection(slug)
}

export { formatPlanPublic }
